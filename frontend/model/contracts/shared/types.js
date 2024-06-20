'use strict'

import {
  objectOf, objectMaybeOf, arrayOf, unionOf, boolean,
  object, string, optional, number, mapOf, literalOf
} from '~/frontend/model/contracts/misc/flowTyper.js'
import {
  CHATROOM_TYPES, CHATROOM_PRIVACY_LEVEL,
  MESSAGE_TYPES, MESSAGE_NOTIFICATIONS, PROPOSAL_VARIANTS, POLL_TYPES
} from './constants.js'

// group.js related

export const inviteType: any = objectOf({
  inviteKeyId: string,
  creatorID: string,
  invitee: optional(string)
})

// chatroom.js related

export const chatRoomAttributesType: any = objectOf({
  name: string,
  description: string,
  // NOTE: creatorID is optional parameter which is not being used
  //       in group contract function gi.actions/group/addChatRoom
  creatorID: optional(string),
  type: unionOf(...Object.values(CHATROOM_TYPES).map(v => literalOf(v))),
  privacyLevel: unionOf(...Object.values(CHATROOM_PRIVACY_LEVEL).map(v => literalOf(v)))
})

export const messageType: any = objectMaybeOf({
  type: unionOf(...Object.values(MESSAGE_TYPES).map(v => literalOf(v))),
  text: string, // message text | notificationType when type if NOTIFICATION
  proposal: objectMaybeOf({
    proposalId: string,
    proposalType: string,
    expires_date_ms: number,
    createdDate: string,
    creatorID: string,
    variant: unionOf(...Object.values(PROPOSAL_VARIANTS).map(v => literalOf(v)))
  }),
  notification: objectMaybeOf({
    type: unionOf(...Object.values(MESSAGE_NOTIFICATIONS).map(v => literalOf(v))),
    params: mapOf(string, string) // { username }
  }),
  attachments: arrayOf(objectOf({
    name: string,
    mimeType: string,
    dimension: optional(objectOf({
      width: number,
      height: number
    })),
    downloadData: objectOf({
      manifestCid: string,
      downloadParams: optional(object)
    })
  })),
  replyingMessage: objectOf({
    hash: string, // scroll to the original message and highlight
    text: string // display text(if too long, truncate)
  }),
  pollData: objectOf({
    question: string,
    options: arrayOf(objectOf({ id: string, value: string })),
    expires_date_ms: number,
    hideVoters: boolean,
    pollType: unionOf(...Object.values(POLL_TYPES).map(v => literalOf(v)))
  }),
  onlyVisibleTo: arrayOf(string) // list of usernames, only necessary when type is NOTIFICATION
})
