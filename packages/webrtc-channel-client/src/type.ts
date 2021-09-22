import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Answer = {
  __typename?: 'Answer';
  answer?: Maybe<RtcSessionDescription>;
  channel: Channel;
  from: Participant;
  to: Participant;
};

export type Candidate = {
  __typename?: 'Candidate';
  candidate?: Maybe<RtcIceCandidate>;
  channel: Channel;
  from: Participant;
  to: Participant;
};

export type Channel = {
  __typename?: 'Channel';
  id: Scalars['String'];
};

export type ChannelInput = {
  id: Scalars['String'];
};

export type ChannelWithParticipant = {
  __typename?: 'ChannelWithParticipant';
  id: Scalars['String'];
  participant: Participant;
};

export type Mutation = {
  __typename?: 'Mutation';
  answer: Scalars['Boolean'];
  candidate: Scalars['Boolean'];
  link: Channel;
  offer: Scalars['Boolean'];
};


export type MutationAnswerArgs = {
  answer: TransferRtcSessionDescriptionInput;
  channel: ChannelInput;
  from: ParticipantInput;
  to: ParticipantInput;
};


export type MutationCandidateArgs = {
  candidate: TransferRtcIceCandidateInput;
  channel: ChannelInput;
  from: ParticipantInput;
  to: ParticipantInput;
};


export type MutationLinkArgs = {
  channel: ChannelInput;
  participant: ParticipantInput;
};


export type MutationOfferArgs = {
  channel: ChannelInput;
  from: ParticipantInput;
  offer: TransferRtcSessionDescriptionInput;
  to: ParticipantInput;
};

export type Offer = {
  __typename?: 'Offer';
  channel: Channel;
  from: Participant;
  offer?: Maybe<RtcSessionDescription>;
  to: Participant;
};

export type Participant = {
  __typename?: 'Participant';
  id: Scalars['String'];
};

export type ParticipantInput = {
  id: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  default?: Maybe<Scalars['String']>;
};

export type RtcIceCandidate = {
  __typename?: 'RTCIceCandidate';
  candidate?: Maybe<Scalars['String']>;
  component?: Maybe<RtcIceComponent>;
  foundation?: Maybe<Scalars['String']>;
  port?: Maybe<Scalars['Int']>;
  priority?: Maybe<Scalars['Int']>;
  protocol?: Maybe<RtcIceProtocol>;
  relatedAddress?: Maybe<Scalars['String']>;
  relatedPort?: Maybe<Scalars['Int']>;
  sdpMLineIndex?: Maybe<Scalars['Int']>;
  sdpMid?: Maybe<Scalars['String']>;
  tcpType?: Maybe<RtcIceTcpCandidate>;
  type?: Maybe<RtcIceCandidateType>;
  usernameFragment?: Maybe<Scalars['String']>;
};

export enum RtcIceCandidateType {
  Host = 'host',
  Prflx = 'prflx',
  Relay = 'relay',
  Srflx = 'srflx'
}

export enum RtcIceComponent {
  Rtcp = 'rtcp',
  Rtp = 'rtp'
}

export enum RtcIceProtocol {
  Tcp = 'tcp',
  Udp = 'udp'
}

export enum RtcIceTcpCandidate {
  Active = 'active',
  Passive = 'passive',
  So = 'so'
}

export enum RtcSdp {
  Answer = 'answer',
  Offer = 'offer',
  Pranswer = 'pranswer',
  Rollback = 'rollback'
}

export type RtcSessionDescription = {
  __typename?: 'RTCSessionDescription';
  sdp?: Maybe<Scalars['String']>;
  type?: Maybe<RtcSdp>;
};

export type Subscription = {
  __typename?: 'Subscription';
  answered: Answer;
  candidated: Candidate;
  linked: ChannelWithParticipant;
  offered: Offer;
};


export type SubscriptionAnsweredArgs = {
  channel: ChannelInput;
};


export type SubscriptionCandidatedArgs = {
  channel: ChannelInput;
};


export type SubscriptionLinkedArgs = {
  channel: ChannelInput;
};


export type SubscriptionOfferedArgs = {
  channel: ChannelInput;
};

export type TransferRtcIceCandidateInput = {
  candidate?: Maybe<Scalars['String']>;
  component?: Maybe<RtcIceComponent>;
  foundation?: Maybe<Scalars['String']>;
  port?: Maybe<Scalars['Int']>;
  priority?: Maybe<Scalars['Int']>;
  protocol?: Maybe<RtcIceProtocol>;
  relatedAddress?: Maybe<Scalars['String']>;
  relatedPort?: Maybe<Scalars['Int']>;
  sdpMLineIndex?: Maybe<Scalars['Int']>;
  sdpMid?: Maybe<Scalars['String']>;
  tcpType?: Maybe<RtcIceTcpCandidate>;
  type?: Maybe<RtcIceCandidateType>;
  usernameFragment?: Maybe<Scalars['String']>;
};

export type TransferRtcSessionDescriptionInput = {
  sdp?: Maybe<Scalars['String']>;
  type?: Maybe<RtcSdp>;
};


      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    