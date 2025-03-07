<template lang='pug'>
  button.is-loader(
    :type='type'
    ref='btn'
    v-bind='$attrs'
    v-on='bindListeners'
    :data-loading='ephemeral.isSubmitting'
    :disabled='disabled || ephemeral.isSubmitting'
  )
    slot
    i18n.sr-only(v-if='ephemeral.isSubmitting') Loading
</template>

<script>
/*
Use ButtonSubmit on buttons that will trigger an **async** action.

button-submit(
  @click='handleLogin'
) Login

This will display a spinner (the loading state) on the button while the login is happening.

The button has type="submit" to catch any way of form submission (ex: press Enter).

That way we don't need to use $refs on the parent.

// ❌ DO NOT do this, it's INCORRECT:
form(@submit.prevent='$refs.btnSubmit.click')

// ✅ DO this instead:
form(@submit.prevent='')

`@submit.prevent` prevents the original behavior of a form submit (page reload)
but it will still look for a submit element and its event handler (@click).

In this case ButtonSubmit is the submit element thanks to type="submit".
So, when pressing Enter, buttonSubmit(@click) gets called directly too.

More details about this approach:
https://github.com/okTurtles/group-income/pull/854/files#r388638068
*/
export default ({
  name: 'ButtonSubmit',
  props: {
    disabled: Boolean,
    type: {
      type: String,
      default: 'submit'
    }
  },
  data: () => ({
    ephemeral: {
      isSubmitting: false
    }
  }),
  methods: {
    async submit (event) {
      if (this.ephemeral.isSubmitting) {
        return
      }
      this.ephemeral.isSubmitting = true

      // Call the original @click handler.
      // this.$listeners can await for async handlers.
      // An advantage over using $emit().
      // More at: https://stackoverflow.com/questions/60554270/vuejs-difference-between-emit-and-listeners
      try {
        await this.$listeners.click(event)
      } catch (error) {
        console.error('ButtonSubmit exception:', error)
      }

      this.ephemeral.isSubmitting = false
    },
    focus () {
      // Used to focus the btn from the parent (ex:GroupCreationModal)
      this.$refs.btn.focus()
    }
  },
  computed: {
    bindListeners () {
      return {
        ...this.$listeners,
        // overrides passed @click handler with a custom @click handler
        // so it goes through "isSubmitting guard"
        click: this.submit
      }
    }
  }
}: Object)
</script>
