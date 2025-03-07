<template lang='pug'>
proposal-template(
  ref='modalTemplate'
  :title='L("Add new members")'
  :disabled='!ephemeral.isValid'
  :maxSteps='config.steps.length'
  :currentStep.sync='ephemeral.currentStep'
  :variant='shouldGenerateInvitesImmediately ? "addMemberImmediate" : "addMember"'
  @submit='submit'
)
  fieldset.c-fieldset(
    v-if='ephemeral.currentStep === 0'
    :class='{"is-shifted": ephemeral.invitesCount > 1}'
    ref='fieldset'
  )
    i18n.label(tag='legend') Full name
    .field.c-fields-item(
      v-for='(member, index) in ephemeral.invitesCount'
      :key='`member-${index}`'
      data-test='invitee'
    )
      i18n.label.sr-only Invitee name
      .inputgroup
        input.input(
          type='text'
          :aria-label='L("Full name")'
          v-model='form.invitees[index]'
          @keyup='(e) => inviteeUpdate(e, index)'
          aria-required
        )
        button.is-icon-small.is-btn-shifted(
          type='button'
          @click='removeInvitee(index)'
          data-test='remove'
          :aria-label='L("Remove invitee")'
        )
          i.icon-times

    button.link.has-icon(
      type='button'
      @click='addInviteeSlot'
      data-test='addInviteeSlot'
    )
      i.icon-plus
      i18n Add more
</template>

<script>
import sbp from '@sbp/sbp'
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { PROPOSAL_INVITE_MEMBER } from '@model/contracts/shared/constants.js'
import ProposalTemplate from './ProposalTemplate.vue'
import { createInvite } from '@controller/actions/utils.js'
export default ({
  name: 'AddMembers',
  mixins: [validationMixin],
  components: {
    ProposalTemplate
  },
  data () {
    return {
      form: {
        invitees: []
      },
      ephemeral: {
        currentStep: 0,
        isValid: false,
        invitesCount: 1
      },
      config: {
        steps: [
          'Member'
        ]
      }
    }
  },
  computed: {
    ...mapState([
      'currentGroupId',
      'loggedIn'
    ]),
    ...mapGetters([
      'ourIdentityContractId',
      'currentGroupState',
      'currentWelcomeInvite',
      'groupShouldPropose',
      'groupSettings'
    ]),
    shouldGenerateInvitesImmediately () {
      return this.currentWelcomeInvite.expires < Date.now() && // 1. anyone-can-join invite has expired
        !this.groupShouldPropose // 2. The group is not big enough to create a proposal
    }
  },
  methods: {
    inviteeUpdate (e, index) {
      if (e.target.value.length > 0 && !this.ephemeral.isValid) {
        this.ephemeral.isValid = true
      }
      if (e.target.value.length === 0 && this.ephemeral.invitesCount === 1 && this.ephemeral.isValid) {
        this.ephemeral.isValid = false
      }
    },
    removeInvitee (index) {
      this.ephemeral.invitesCount -= 1
      this.form.invitees.splice(index, 1)
    },
    addInviteeSlot (e) {
      this.ephemeral.invitesCount += 1
      Vue.nextTick(() => {
        const inviteeSlots = this.$refs.fieldset.getElementsByTagName('label')
        const newInviteeSlot = inviteeSlots[inviteeSlots.length - 1]
        newInviteeSlot && newInviteeSlot.focus()
      })
    },
    async generateInviteImmediately () {
      const groupId = this.currentGroupId
      for (const invitee of this.form.invitees) {
        try {
          const inviteCreated = await createInvite({
            contractID: groupId,
            invitee,
            creatorID: this.ourIdentityContractId,
            expires: this.groupSettings.inviteExpiryProposal
          })

          await sbp('gi.actions/group/invite', {
            contractID: groupId,
            data: inviteCreated
          })
        } catch (err) {
          // TODO: add a logic to present the error in the UI
          console.error(`Invite to ${invitee} failed to be sent!`, err?.message)
          break
        }
      }
    },
    async submit (form) {
      if (this.shouldGenerateInvitesImmediately) {
        await this.generateInviteImmediately()

        this.$refs.modalTemplate.close()
      } else {
        let hasFailed = false
        // NOTE: All invitees proposals will expire at the exact same time.
        // That plus the proposal creator is what we'll use to know
        // which proposals should be displayed visually together.
        const expiresDateMs = Date.now() + this.groupSettings.proposals[PROPOSAL_INVITE_MEMBER].expires_ms

        for (const invitee of this.form.invitees) {
          const groupId = this.currentGroupId
          try {
            await sbp('gi.actions/group/proposal', {
              contractID: groupId,
              data: {
                proposalType: PROPOSAL_INVITE_MEMBER,
                proposalData: {
                  memberName: invitee,
                  reason: form.reason
                },
                votingRule: this.groupSettings.proposals[PROPOSAL_INVITE_MEMBER].rule,
                expires_date_ms: expiresDateMs
              }
            })
          } catch (e) {
            hasFailed = true
            console.error(`Invite to ${invitee} failed to be sent!`, e.message)
            break
          }
        }
        if (!hasFailed) {
          this.ephemeral.currentStep += 1 // Show Success step!
        }
      }
    }
  }
}: Object)
</script>
<style lang="scss" scoped>
@import "@assets/style/_variables.scss";

.c-fields-item {
  margin-bottom: 1rem;
}

.c-feedback {
  text-align: center;
}

.c-fieldset {
  .is-btn-shifted {
    display: none;
  }

  &.is-shifted {
    .is-btn-shifted {
      display: block;
    }
  }
}
</style>
