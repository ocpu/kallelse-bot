import { Client } from 'eris'
import { createTransport } from 'nodemailer'
import { argv } from './util'
import { parseHTML, parseText } from './text-parser'

const transport = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  from: process.env.MAIL_USER_ALIAS || process.env.MAIL_USER
})

const bot = new Client(process.env.BOT_TOKEN!)

bot.on('ready', () => {
  console.log('Logged in as %s!', bot.user.username)
})

bot.on('messageCreate', async msg => {
  if (msg.content.startsWith(bot.user.mention)) {
    const args = argv(msg.content)
    args.shift() // The mention
    let subject = args.shift()
    let test = false
    if (subject === '--help' || subject === '-h' || subject === 'help') {
      const ch = await msg.author.getDMChannel()
      ch.createMessage(helpMessage)
      return
    } else if (subject === '--test' || subject === '-t' || subject === 'test') {
      subject = args.shift()
      test = true
    }
    let text: string
    let html: string
    try {
      const joined = args.join(' ')
      text = parseText(joined)
      html = parseHTML(joined)
    } catch {
      return msg.channel.createMessage({ content: 'Sorry what was that?' })
    }
    if (test) {
      try {
        const ch = await msg.author.getDMChannel()
        await ch.createMessage({
          embed: {
            author: { name: msg.author.username, icon_url: msg.author.avatarURL },
            title: subject,
            description: text
          }
        })
      } catch {
        // Do something
      }
    } else {
      try {
        await msg.channel.createMessage({
          embed: {
            author: { name: msg.author.username, icon_url: msg.author.avatarURL },
            title: subject,
            description: text
          }
        })
        await msg.delete()
        transport.sendMail({ to: process.env.RECEIVERS!.split(' '), subject, text, html })
      } catch {
        // Do something
      }
    }
  }
})

const helpMessage = `
**Usage**: <mention> "<subject>" ...text

If the subject line is --help, -h or help I will get you this help text.

If the subject line is --test, -t or test I will let you test me out and I will DM you the result.

__**Warning**__ I will remove your command you sent to me and replace it with the result.

The text is a LaTeX like script and these built in commands are available:
__**Commands**__
**\\newline**: Creates a new line
**\\nl**: Creates a new line
**\\space**: Creates a extra space
**\\h1{**title**}**: Creates a h1 title
**\\p{**text**}**: Creates paragraph of text
**\\set{**name**}{**value**}**: Creates a name like the ones above to create a compound

__**Compounds**__
A compound is used by **\\** (backslash) and the name of the compound. These compounds can be used to shorten otherwise long text that might be copied more than once. The compounds (when creating) take parameters in a form of the **#** (hash sign) and the index of the parameter. If we would rewrite the **\\space** compund it would look like this: **\\set{**space**}{** **}**. If we would do the same to the **\\h1{**title**}** compound it would look like this: **\\set{**h1**}{**<h1>#1</h1>**}**. If you want to use the # would with a number after without it representing a parameter prefix the **#** with a **\\** (backslash).

__**Comments**__
If comments are ever needed the syntax for them are **% your comment**. If you would like to use the **%** sign without it becoming a comment prefix the **%** with a **\\** (backslash).
`.trim()

transport
  .verify()
  .then(() => bot.connect())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
