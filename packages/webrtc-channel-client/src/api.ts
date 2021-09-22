import { gql } from '@apollo/client';

export const MUTATION_LINK = gql`
  mutation Mutation($channel: ChannelInput!, $participant: ParticipantInput!) {
    link(channel: $channel, participant: $participant) {
      id
    }
  }
`;

export const MUTATION_OFFER = gql`
  mutation Mutation(
    $channel: ChannelInput!,
    $from: ParticipantInput!,
    $to: ParticipantInput!,
    $offer: TransferRTCSessionDescriptionInput!) {
    offer(channel: $channel, from: $from, to: $to, offer: $offer)
  }
`;

export const MUTATION_ANSWER = gql`
  mutation Mutation(
    $channel: ChannelInput!,
    $from: ParticipantInput!,
    $to: ParticipantInput!,
    $answer: TransferRTCSessionDescriptionInput!) {
    answer(channel: $channel, from: $from, to: $to, answer: $answer)
  }
`;

export const MUTATION_CANDIDATE = gql`
  mutation Mutation(
    $channel: ChannelInput!,
    $from: ParticipantInput!,
    $to: ParticipantInput!,
    $candidate: TransferRTCIceCandidateInput!) {
    candidate(channel: $channel, from: $from, to: $to, candidate: $candidate)
  }
`;

export const SUBSCRIPTION_LINKED = gql`
  subscription Subscription($channel: ChannelInput!) {
    linked(channel: $channel) {
      id
      participant {
        id
      }
    }
  }
`;

export const SUBSCRIPTION_OFFERED = gql`
  subscription Subscription($channel: ChannelInput!) {
    offered(channel: $channel) {
      channel {
        id
      }
      from {
        id
      }
      to {
        id
      }
      offer {
        sdp
        type
      }
    }
  }
`;

export const SUBSCRIPTION_ANSWERED = gql`
  subscription Subscription($channel: ChannelInput!) {
    answered(channel: $channel) {
      channel {
        id
      }
      from {
        id
      }
      to {
        id
      }
      answer {
        sdp
        type
      }
    }
  }
`;

export const SUBSCRIPTION_CANDIDATED = gql`
  subscription Subscription($channel: ChannelInput!) {
    candidated(channel: $channel) {
      channel {
        id
      }
      from {
        id
      }
      to {
        id
      }
      candidate {
        candidate
        component
        foundation
        port
        priority
        protocol
        relatedAddress
        relatedPort
        sdpMLineIndex
        sdpMid
        tcpType
        type
        usernameFragment
      }
    }
  }
`;
