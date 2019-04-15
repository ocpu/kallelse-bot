# Kallelse bot

This is a [Discord](https://discordapp.com) bot that can send callings to to everyone in your Discord guild/server and to specified persons in email form aswell. The bot can be used like the following and is built upon my own LaTeX like text parser.

## Usage
_This is what the help command prints to you_

**Usage**: <mention> "<subject>" ...text

If the subject line is --help, -h or help I will get you this help text.

If the subject line is --test, -t or test I will let you test me out and I will DM you the result.

__**Warning**__ I will remove your command you sent to me and replace it with the result.

The text is a LaTeX like script and these built in commands are available:

__**Commands**__<br>
**\newline**: Creates a new line<br>
**\nl**: Creates a new line<br>
**\space**: Creates a extra space<br>
**\h1{**title**}**: Creates a h1 title<br>
**\p{**text**}**: Creates paragraph of text<br>
**\set{**name**}{**value**}**: Creates a name like the ones above to create a compound

__**Compounds**__<br>
A compound is used by **\\** (backslash) and the name of the compound. These compounds can be used to shorten otherwise long text that might be copied more than once. The compounds (when creating) take parameters in a form of the **#** (hash sign) and the index of the parameter. If we would rewrite the **\space** compund it would look like this: **\set{**space**}{** **}**. If we would do the same to the **\h1{**title**}** compound it would look like this: **\set{**h1**}{**\<h1>#1\</h1>**}**. If you want to use the # would with a number after without it representing a parameter prefix the **#** with a **\\** (backslash).

__**Comments**__<br>
If comments are ever needed the syntax for them are **% your comment**. If you would like to use the **%** sign without it becoming a comment prefix the **%** with a **\\** (backslash).
