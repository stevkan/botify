const { ComponentDialog, ChoicePrompt, ListStyle } = require('botbuilder-dialogs');

const CHOICE_PROMPT = 'INTERRUPT_CHOICE_PROMPT'

class InterruptDialog extends ComponentDialog {
  constructor(id) {
    super(id);
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
  }

  async onBeginDialog(innerDc, options) {
    const result = await this.interrupt(innerDc);
    if (result) {
      return result;
    }
    return await super.onBeginDialog(innerDc, options);
  }

  async onContinueDialog(innerDc) {
    const result = await this.interrupt(innerDc);
    if (result) {
      return result;
    }
    return await super.onContinueDialog(innerDc);
  }

  async onEndDialog(innerDc) {
  }

  async interrupt(innerDc, next, text) {
    const activity = innerDc.context.activity;

    if (innerDc.context.activity.type === 'message') {
      if (!activity.text) {
        text = ""
      } else {
        text = activity.text.toLowerCase();

        switch (text) {
          case 'help':
            let message = 'Your help options'
            const options = ['View Products', 'Cart', 'Checkout', 'Cancel']

            return await innerDc.prompt(CHOICE_PROMPT, {
              prompt: message,
              choices: options,
              style: ListStyle.suggestedAction
            });
          case 'quit':
          case 'cancel':
            await innerDc.context.sendActivity('Cancelling your shopping experience');
            return await innerDc.cancelAllDialogs();
        }
      }
    }
  }
}

module.exports.InterruptDialog = InterruptDialog;
