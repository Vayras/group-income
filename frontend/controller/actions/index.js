import sbp from '@sbp/sbp'
import { findKeyIdByName } from '~/shared/domains/chelonia/utils.js'
// Using relative path to crypto.js instead of ~-path to workaround some esbuild bug
import { deserializeKey, encrypt } from '../../../shared/domains/chelonia/crypto.js'

export { default as chatroom } from './chatroom.js'
export { default as group } from './group.js'
export { default as identity } from './identity.js'
export { default as mailbox } from './mailbox.js'

sbp('sbp/selectors/register', {
  // Utility function that covers the common scenario of needing to share some
  // contract's secret keys with another contract. This function emits OP_KEY_SHARE
  // by calling 'chelonia/out/keyShare'.
  // One common use case for this function is sharing keys with ourselves after
  // creating a new contract (for example, when we create a group) or to share
  // keys of a child contract with a parent contract (such as sharing the keys to
  // a chat room with its parent group contract)
  'gi.actions/out/shareVolatileKeys': async ({ destinationContractID, destinationContractName, contractID }) => {
    if (destinationContractID === contractID) {
      return
    }

    const contractState = await sbp('chelonia/latestContractState', contractID)

    if (contractState?._volatile?.keys) {
      const state = await sbp('chelonia/latestContractState', destinationContractID)

      const CEKid = findKeyIdByName(state, 'cek')
      const CSKid = findKeyIdByName(state, 'csk')

      const CEK = deserializeKey(state?._volatile?.keys?.[CEKid])

      await sbp('chelonia/out/keyShare', {
        destinationContractID,
        destinationContractName,
        data: {
          contractID,
          keys: Object.entries(contractState._volatile.keys).map(([keyId, key]: [string, mixed]) => ({
            id: keyId,
            meta: {
              private: {
                keyId: CEKid,
                content: encrypt(CEK, (key: any))
              }
            }
          }))
        },
        signingKeyId: CSKid
      })
    }
  }
})
