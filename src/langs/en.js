module.exports = {
  bot: {
    help: {
      text: "Help",
      description: "The bot does not have a command. To create or manage giveaways, you must visit our website and log in to the control panel. \n\n Control Panel: https://awardbot.me/dashboard",
    },
    invite: {
      invitations: "Invitations",
      not_found: "No invitations found!",
      description: "It shows the detailed statistics of the invitations you made on the server.",
      all_invites: "All Invites",
      regular: "Regular",
      left: "Left",
      fake: "Fake"
    },
    language: {
      embed_description: "The bot's language has been successfully changed.",
      text: "Language",
      from: "From",
      to: "To"
    },
    permission: {
      noperm: ":x: **|** You must be `*` or `MANAGE_PERMS` permission to use this command**!**",
      list_text: "'s Permissions",
      add_description: "`**|** ``{perm}`` permission has been given to ``{username}``**!**",
      remove_description: "**|** ``{perm}`` permission has been removed from ``{username}``**!**",
      default: "**|** Unknown command**!**"
    },
    redeem: {
      noperm: ":x: **|** You must be `*` permission to use this command**!**",
      not_found: ":x: **|** Redeem code not found**!**",
      embed_text: "📎 | We have a promo code for you!",
      embed_description: "> `🖇️` __Code:__ ``{code}`` \n> `💻` __Max Uses:__ ``{code_uses}`` \n> `⏲️` __Expires at:__ <t:{time}>"
    }
  },
  global: {
    successful: "Successful.",
    something_went_wrong: "Something went wrong.",
    you_are_banned: "You are banned from award!",
    beta_mode: "award is currently in beta mode, you must be a beta user to access it.",
    maintenance_mode: "We are currently doing maintenance to improve our systems, please try later."
  },
  server: {
    no_token_provided: "No authorization token provided!",
    not_found: "404: Route does not exist."
  },
  guilds: {
    channels: {
      not_found: "Guild not found!"
    }
  },
  boost: {
    not_found: "Guild not found!",
    invalid_boost: "Boost not found!",
    using: "Boost is being used on another server!",
    not_using: "Boost is not used.",
    expired: "Boost has expired!"
  },
  requireds: {
    github: {
      connect_account: "Connect your GitHub account to join in the giveaway.",
      follow_account: "Follow the GitHub profile to join the giveaway."
    },
    discord: {
      connect_account: "Connect your Discord account to join in the giveaway.",
      cancelled: "The giveaway has been cancelled.",
      join_guild: "You must join the Discord server to join in the giveaway.",
      missing_role: "You don't have role for this giveaway.",
      select_role: "You must select a role.",
      select_invite: "Choose how many invitations are needed when participating in the giveaway.",
      missing_invite: "Number of missing invitations; {invite}/{invitelimit}"
    },
    twitch: {
      connect_account: "Connect your Twitch account to join in the giveaway.",
      follow_account: "Follow the Twitch channel to join the giveaway."
    },
    youtube: {
      connect_account: "Connect your YouTube account to join in the giveaway.",
      terminated: "Your YouTube session has been terminated, log in again.",
      subscribe_channel: "Subscribe to the YouTube channel to join the giveaway."
    }
  },
  giveaway: {
    cancel: {
      not_found: "Giveaway not found!",
      bot_not_found: "The bot was not found on the guild!",
      user_not_found: "You're not in the guild!"
    },
    create: {
      not_found: "Guild not found!",
      user_not_found: "You're not in the guild!",
      channel_not_found: "Channel not found!",
      giveaway_not_found: "Giveaway not found!",
      access_denied: "Access denied!",
      invite_per: "To add this requirement, the bot needs MANAGE_GUILD privilege.",
      channel_type: "Channel type must be text!",
      winners_min: "Winners count minumum must be 1!",
      winners_max: "Winners count maximum must be 10!",
      duration_min: "Duration minumum must be 1 minute!",
      duration_max: "Duration maximum must be 3 months!",
      limit: "Giveaway limit reached!",
      connect_account: "You haven't linked your account!",
      no_access: "Bot has no access to the channel!",
      specify: "Please specify a {PARAM}!",
      max_length: "Title and award cannot exceed 30 characters, description cannot exceed 250 characters!"
    },
    join: {
      not_found: "Giveaway not found!",
      joined: "You've already joined the giveaway!"
    },
    overview: {
      not_found: "Giveaway not found!"
    },
    pin: {
      not_correct: "Pin is incorrect."
    }
  }
};