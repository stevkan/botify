const { CardFactory } = require('botbuilder');
const { MainBot } = require('./mainBot');
const WelcomeCard = require('../resources/json/welcomeCard');

class WelcomeBot extends MainBot {
  constructor(conversationState, userState, dialog) {
    super(conversationState, userState, dialog);

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
          await context.sendActivity({ attachments: [welcomeCard] });
        }
      }

      await next();
    });
  }
}

module.exports.WelcomeBot = WelcomeBot;
