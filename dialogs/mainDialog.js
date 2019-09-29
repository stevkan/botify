// const {  } = require('botbuilder');
const { ChoicePrompt, ConfirmPrompt, DialogSet, DialogTurnStatus, ListStyle, WaterfallDialog } = require('botbuilder-dialogs');
const { InterruptDialog } = require('./interruptDialog');
const { DemoProducts, DEMO_PRODUCTS } = require('./demoProducts');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const CHOICE_PROMPT = 'mainChoicePrompt'
const CONFIRM_PROMPT = 'mainConfirmPrompt'

class MainDialog extends InterruptDialog {
  constructor(id, conversationState, userState) {
    super(id);

    this.mainId = id;
    this.conversationState = conversationState;
    this.userState = userState;

    this.addDialog(new ChoicePrompt(CHOICE_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(new DemoProducts(DEMO_PRODUCTS))
      .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
        this.introStep.bind(this),
        this.actionStep.bind(this),
        this.anotherStep.bind(this),
        this.finalStep.bind(this)
      ]));

    this.initialDialogId = MAIN_WATERFALL_DIALOG;
  };

  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    this.id = this.mainId;
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      return await dialogContext.beginDialog(this.id);
    }
  };

  async introStep(stepContext) {
    let message = 'Pick from these options'
    const options = ['Demo Products', 'Demo Collection', 'Checkout', 'Cancel']

    return await stepContext.prompt(CHOICE_PROMPT, {
      prompt: message,
      choices: options,
      style: ListStyle.suggestedAction
    });
  };

  async actionStep(stepContext) {
    const stepResult = stepContext.context.activity.text.toLowerCase();

    switch (stepResult) {
      case 'demo products':
        await stepContext.beginDialog(DEMO_PRODUCTS, stepResult);
        return { status: DialogTurnStatus.waiting };
      case 'demo collection':
        return await stepContext.beginDialog();
      case 'checkout':
        return await stepContext.beginDialog();
      default:
        return await stepContext.next();
    };
  };

  async anotherStep(stepContext) {
    return await stepContext.prompt(CONFIRM_PROMPT, 'Perform another action?');
  };

  async finalStep(stepContext) {
    console.log(stepContext)
    const stepResult = stepContext.result
    
    if (stepResult === true) {
      return await stepContext.replaceDialog(MAIN_WATERFALL_DIALOG);
    }

    if (stepResult === false) {
      await stepContext.context.sendActivity('Thank you for trying Botify!')
      return await stepContext.endDialog(stepContext);
    }
  };
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_WATERFALL_DIALOG = MAIN_WATERFALL_DIALOG;
