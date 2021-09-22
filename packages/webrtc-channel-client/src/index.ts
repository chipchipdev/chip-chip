import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { v4 as uuid } from 'uuid';
import {
  delay, of, Subject,
} from 'rxjs';
import { createSubscriptionClient } from './subscription-client';
import {
  Channel, ChannelWithParticipant,
  Offer, Answer, Candidate,
  MutationLinkArgs, MutationOfferArgs,
  MutationAnswerArgs, MutationCandidateArgs,
  SubscriptionLinkedArgs, SubscriptionOfferedArgs,
  SubscriptionAnsweredArgs, SubscriptionCandidatedArgs,
  TransferRtcIceCandidateInput,
  TransferRtcSessionDescriptionInput,
} from './type';
import {
  MUTATION_LINK, MUTATION_OFFER,
  MUTATION_ANSWER, MUTATION_CANDIDATE,
  SUBSCRIPTION_LINKED, SUBSCRIPTION_OFFERED,
  SUBSCRIPTION_ANSWERED, SUBSCRIPTION_CANDIDATED,
} from './api';

enum PeerConnectionType {
  OFFER,
  ANSWER,
}

interface WebrtcChannelClientEventMap<ChannelMessage> {
  message: ChannelMessage,
}

export default class WebrtcChannelClient<ChannelMessage> {
  public id: string = uuid() + Date.now();

  public client: ApolloClient<NormalizedCacheObject>;

  public connections: { id: string, connection: RTCPeerConnection }[] = [];

  public sendChannels: RTCDataChannel[] = [];

  public receiveChannels: RTCDataChannel[] = [];

  private connection$ = new Subject<{ id: string, connection: RTCPeerConnection }>();

  private sendChannel$ = new Subject<RTCDataChannel>();

  private receiveChannel$ = new Subject<RTCDataChannel>();

  private linked$ = new Subject<ChannelWithParticipant>();

  private offered$ = new Subject<Offer>();

  private answered$ = new Subject<Answer>();

  private candidated$ = new Subject<Candidate>();

  private message$ = new Subject<ChannelMessage>();

  constructor(uri: string, wsuri: string, channel: Channel) {
    this.client = createSubscriptionClient(uri, wsuri);

    this
      .subscriptionLinked({ channel })
      .subscribe(({ data }) => {
        if (data?.linked) this.linked$.next(data.linked);
      });

    this
      .subscriptionOffered({ channel })
      .subscribe(({ data }) => {
        if (data?.offered) this.offered$.next(data.offered);
      });

    this
      .subscriptionAnswered({ channel })
      .subscribe(({ data }) => {
        if (data?.answered) this.answered$.next(data.answered);
      });

    this
      .subscriptionCandidate({ channel })
      .subscribe(({ data }) => {
        if (data?.candidated) this.candidated$.next(data.candidated);
      });

    this.monitorConnectionSubjects(channel);

    this.triggerConnection(channel);
  }

  public addEventListener: <K extends keyof WebrtcChannelClientEventMap<ChannelMessage>>(
    type: K,
    listener: (
      this: WebrtcChannelClient<ChannelMessage>,
      ev: WebrtcChannelClientEventMap<ChannelMessage>[K]) => any
  ) => void = (type, listener) => {
    switch (type) {
      case 'message':
        this.message$.subscribe((message) => {
          listener.call(this, message);
        });
        break;
      default:
        break;
    }
  };

  public begin() {
    this.connection$.complete();
    this.sendChannel$.complete();
    this.receiveChannel$.complete();
    this.linked$.complete();
    this.offered$.complete();
    this.candidated$.complete();

    this.enableReceivedChannels();
  }

  public finish() {
    this.message$.complete();
  }

  public send(message: ChannelMessage) {
    try {
      this.sendChannels.forEach((channel) => {
        if (typeof message === 'string') {
          channel.send(message);
        } else {
          channel.send(JSON.stringify(message));
        }
      });
    } catch (e) {
      throw new Error('message should be stringify');
    }
  }

  private monitorConnectionSubjects(channel: Channel) {
    this.sendChannel$.subscribe((sendChannel) => this.sendChannels.push(sendChannel));
    this.receiveChannel$.subscribe((receiveChannel) => this.receiveChannels.push(receiveChannel));
    this.connection$.subscribe((connection) => this.connections.push(connection));

    this.linked$.subscribe(async (channelWithParticipant) => {
      const { id, participant } = channelWithParticipant;

      if (this.id === participant.id) return;

      const peerConnection = await this.createRTCPeerConnectionAndSetupSendChannel(
        PeerConnectionType.OFFER,
        { channel: { id }, participant } as MutationLinkArgs,
      );

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      await this.mutationOffer({
        channel: { id: channel.id },
        from: { id: this.id },
        to: { id: participant.id },
        offer: offer as TransferRtcSessionDescriptionInput,
      });
    });

    this.offered$.subscribe(async (offer) => {
      if (this.id !== offer.to.id) return;

      if (this.id === offer.from.id) return;

      const peerConnection = await this.createRTCPeerConnectionAndSetupSendChannel(
        PeerConnectionType.ANSWER,
        offer as MutationOfferArgs,
      );

      await peerConnection.setRemoteDescription(offer.offer as RTCSessionDescriptionInit);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      await this.mutationAnswer({
        channel: { id: channel.id },
        from: { id: this.id },
        to: { id: offer.from.id },
        answer: answer as TransferRtcSessionDescriptionInput,
      });
    });

    this.answered$.subscribe(async (answer) => {
      if (this.id !== answer.to.id) return;

      if (this.id === answer.from.id) return;

      const peerConnection = this.connections.find((c) => c.id === answer.from.id);

      if (!peerConnection) return;

      await peerConnection.connection
        .setRemoteDescription(answer.answer as RTCSessionDescriptionInit);
    });

    this.candidated$.subscribe(async (candidate) => {
      if (this.id !== candidate.to.id) return;

      if (this.id === candidate.from.id) return;

      const peerConnection = this.connections.find((c) => c.id === candidate.from.id);

      if (!peerConnection) return;

      await peerConnection.connection.addIceCandidate(candidate.candidate as RTCIceCandidate);
    });
  }

  private triggerConnection(channel: Channel) {
    of(null)
      .pipe(delay(500))
      .subscribe(async () => {
        await this.mutationLink({
          channel: { id: channel.id },
          participant: {
            id: this.id,
          },
        });
      });
  }

  private mutationLink(args: MutationLinkArgs) {
    return this.client.mutate<
    { link: Channel },
    MutationLinkArgs
    >({
      mutation: MUTATION_LINK,
      variables: args,
    });
  }

  private mutationOffer(args: MutationOfferArgs) {
    return this.client.mutate<
    { offer: boolean },
    MutationOfferArgs
    >({
      mutation: MUTATION_OFFER,
      variables: args,
    });
  }

  private mutationAnswer(args: MutationAnswerArgs) {
    return this.client.mutate<
    { answer: boolean },
    MutationAnswerArgs
    >({
      mutation: MUTATION_ANSWER,
      variables: args,
    });
  }

  private mutationCandidate(args: MutationCandidateArgs) {
    return this.client.mutate<
    { candidate: boolean },
    MutationCandidateArgs
    >({
      mutation: MUTATION_CANDIDATE,
      variables: args,
    });
  }

  private subscriptionLinked(args: SubscriptionLinkedArgs) {
    return this.client.subscribe<
    { linked: ChannelWithParticipant },
    SubscriptionLinkedArgs
    >({
      query: SUBSCRIPTION_LINKED,
      variables: args,
    });
  }

  private subscriptionOffered(args: SubscriptionOfferedArgs) {
    return this.client.subscribe<
    { offered: Offer },
    SubscriptionOfferedArgs
    >({
      query: SUBSCRIPTION_OFFERED,
      variables: args,
    });
  }

  private subscriptionAnswered(args: SubscriptionAnsweredArgs) {
    return this.client.subscribe<
    { answered: Answer },
    SubscriptionAnsweredArgs
    >({
      query: SUBSCRIPTION_ANSWERED,
      variables: args,
    });
  }

  private subscriptionCandidate(args: SubscriptionCandidatedArgs) {
    return this.client.subscribe<
    { candidated: Candidate },
    SubscriptionCandidatedArgs
    >({
      query: SUBSCRIPTION_CANDIDATED,
      variables: args,
    });
  }

  private async createRTCPeerConnectionAndSetupSendChannel(
    type: PeerConnectionType, args: MutationLinkArgs | MutationOfferArgs,
  ) {
    const peerConnection = new RTCPeerConnection();

    let sendChannel: RTCDataChannel;

    if (type === PeerConnectionType.OFFER) {
      const { participant } = args as MutationLinkArgs;
      sendChannel = peerConnection.createDataChannel(participant.id);
      this.connection$.next({ id: participant.id, connection: peerConnection });
    } else if (type === PeerConnectionType.ANSWER) {
      const { from } = args as MutationOfferArgs;
      sendChannel = peerConnection.createDataChannel(from.id);
      this.connection$.next({ id: from.id, connection: peerConnection });
    }

    peerConnection.onicecandidate = async (e) => {
      const { candidate } = e;

      if (!candidate) return;

      if (type === PeerConnectionType.OFFER) {
        const { participant, channel } = args as MutationLinkArgs;
        await this.mutationCandidate({
          channel: { id: channel.id },
          from: {
            id: this.id,
          },
          to: { id: participant.id },
          candidate: candidate as TransferRtcIceCandidateInput,
        });
        return;
      }

      if (type === PeerConnectionType.ANSWER) {
        const { channel, from, to } = args as MutationOfferArgs;
        await this.mutationCandidate({
          channel: { id: channel.id },
          from: { id: to.id },
          to: { id: from.id },
          candidate: candidate as TransferRtcIceCandidateInput,
        });
      }
    };

    peerConnection.ondatachannel = (e) => {
      const { channel } = e;

      if (!channel) return;

      this.receiveChannel$.next(channel);
    };

    this.sendChannel$.next(sendChannel);

    return peerConnection;
  }

  private enableReceivedChannels() {
    this.receiveChannels.forEach((channel) => {
      // eslint-disable-next-line no-param-reassign
      channel.onmessage = (ev) => {
        const { data } = ev;

        if (!data) return;

        try {
          this.message$.next(JSON.parse(data) as ChannelMessage);
        } catch {
          console.log('fallback to string');
          this.message$.next(data as ChannelMessage);
        }
      };
    });
  }
}
