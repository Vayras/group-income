<template lang='pug'>
.c-news-and-updates-container
  .c-post-block(v-for='(post, index) in dummyPosts' :key='index')
    .c-post-created-date {{ humanDate(post.createdAt, { month: 'long', year: 'numeric', day: 'numeric' }) }}

    .card.c-post-card
      .c-post-img-container
        avatar.c-post-img(
          src='/assets/images/group-income-icon-transparent-circle.png'
          alt='GI Logo'
          size='xs'
        )
      .c-post-content
        h3.is-title-4 {{ post.title }}
        render-message-with-markdown(:text='post.content')
        //- div(v-safe-html:a='renderMarkdown(post.content)')
</template>

<script>
import { humanDate } from '@model/contracts/shared/time.js'
import Avatar from '@components/Avatar.vue'
import RenderMessageWithMarkdown from '@containers/chatroom/chat-mentions/RenderMessageWithMarkdown.js'

const dummyPosts = [
  {
    createdAt: new Date('2024-10-29T00:00:01'),
    title: '1.1.0 Released!',
    content: '**New Features**\n\n' +
      '- New image viewer: zoom in and out of photos with ease!\n' +
      '- "Notes to self": can create DM\'s to yourself now\n' +
      '- Notifications for non-monetary contributions updates\n' +
      '- Anyone-can-join invite links are now updated to support maximum 150 invitations\n\n' +
      '  NOTE: old anyone-can-join invite links are expired, please use the new one!\n' +
      '**Bugfixes**\n\n' +
      '- The emoji selector\'s search field is now selected when you open it\n' +
      '- Fix for usernames in app notifications when user is removed\n' +
      '- Fix for "haven\'t logged in" users metric\n' +
      '- Fixed a markdown-related formatting issue related to lists\n' +
      '- Fixed send button not enabled when pasting text into chat\n' +
      '- Fix closing expired proposals\n\n' +
      '**Improvements**\n\n' +
      '- Add a red badge to the info icon to make it easier to see where DMs are\n' +
      '- Improved edit message input field hight\n' +
      '- Placeholders for payment info fields\n' +
      '- Misc. internal improvements'
  },
  {
    createdAt: new Date('2024-07-26T00:00:01'),
    title: 'Group Income 1.0 released! 🥳',
    content: '🎦 See the release party footage:\n\n' +
      '[https://groupincome.org/2024/07/group-income-released/](https://groupincome.org/2024/07/group-income-released/)'
  },
  {
    createdAt: new Date('2023-06-08T00:00:01'),
    title: 'The Prototype is Ready',
    content: "It's been quite a journey, but we're finally here. A new kind of software is ready for testing. " +
      "If you have a group of friends/family that's interested in supporting one another using monetary and non-monetary means, " +
      "you're a perfect fit to try out the Group Income prototype, and we want to hear from you! Read more on our blog: " +
      '[https://groupincome.org/2023/06/the-prototype-is-ready/](https://groupincome.org/2023/06/the-prototype-is-ready/)'
  },
  {
    createdAt: new Date('2021-06-08T00:00:01'),
    title: 'Roadmap Updates',
    content: "Some say it's not the destination that matters so much, but the journey and friends you meet along the way. " +
    "I couldn't agree more. But also, destinations aren't to be underestimated either! Back in 2019, during the Before Times, " +
    'our team — a mixture of independent contractors and volunteers — got together. Read more on our blog: ' +
    '[https://groupincome.org/2021/06/bulgaria-hackathon-2019-roadmap-updates-hiring/](https://groupincome.org/2021/06/bulgaria-hackathon-2019-roadmap-updates-hiring/)'
  }
]

export default ({
  name: 'NewAndUpdates',
  components: {
    Avatar,
    RenderMessageWithMarkdown
  },
  data () {
    return {
      dummyPosts
    }
  },
  methods: {
    humanDate
  }
}: Object)
</script>

<style lang="scss" scoped>
@import "@assets/style/_variables.scss";

.c-post-block {
  position: relative;
  width: 100%;
  margin-bottom: 2rem;
}

.c-post-created-date {
  padding-left: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.c-post-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;

  .c-post-img-container {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background-color: $general_2;
    flex-shrink: 0;
  }

  .c-post-content {
    flex-grow: 1;

    h3 {
      margin-bottom: 0.25rem;
    }
  }
}
</style>
