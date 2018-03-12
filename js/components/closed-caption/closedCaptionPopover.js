var React = require('react'),
    CONSTANTS = require('../../constants/constants'),
    Utils = require('../utils'),
    AccessibleMenu = require('../higher-order/accessibleMenu'),
    AccessibleButton = require('../accessibleButton'),
    OnOffSwitch = require('./onOffSwitch'),
    ClassNames = require('classnames'),
    CloseButton = require('../closeButton');

var ClosedCaptionPopover = React.createClass({

  handleMoreCaptions: function() {
    if (this.moreOptionsBtn) {
      // When the Closed Captions screen is closed it will go straight to the control bar without
      // showing this popover. Make sure CC button gets focus when that happens if it was originally
      // triggered with the keyboard.
      if (this.moreOptionsBtn.wasTriggeredWithKeyboard()) {
        this.props.controller.state.focusedControl = CONSTANTS.FOCUS_IDS.CLOSED_CAPTIONS;
      }
      this.props.controller.state.closedCaptionOptions.autoFocus = this.moreOptionsBtn.wasTriggeredWithKeyboard();
      this.moreOptionsBtn.wasTriggeredWithKeyboard(false);
    }
    this.props.controller.toggleScreen(CONSTANTS.SCREEN.CLOSEDCAPTION_SCREEN);
    this.handleClose();
  },

  handleClose: function() {
    this.props.togglePopoverAction({
      restoreToggleButtonFocus: true
    });
  },

  handleChangeLanguage: function (language) {
    var availableLanguages = this.props.closedCaptionOptions.availableLanguages;
    var invertedLocale = {};
    for (var i = 0; i < availableLanguages.languages.length; i++) {
      invertedLocale[availableLanguages.locale[availableLanguages.languages[i]]] = availableLanguages.languages[i];
    }

    if (!this.props.closedCaptionOptions.enabled) {
      this.props.controller.toggleClosedCaptionEnabled();
    }

    this.props.controller.onClosedCaptionChange('language', invertedLocale[language]);
    this.setState({
      selectedLanguage: language
    });
  },

  setClassname: function(item) {
    var selectedLanguage = this.props.closedCaptionOptions.availableLanguages.locale[this.props.closedCaptionOptions.language]
    return ClassNames({
      'oo-item': true,
      'oo-item-selected': selectedLanguage == item && this.props.closedCaptionOptions.enabled,
      'oo-disabled': !this.props.closedCaptionOptions.enabled
    });
  },

  render: function() {
    var captionBtnText = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.CC_OPTIONS, this.props.localizableStrings);

    var availableLanguages = this.props.closedCaptionOptions.availableLanguages.locale;
    var dataContentBlocks = [];
    for (var i in availableLanguages) {
      dataContentBlocks.push(
       <a className={this.setClassname(availableLanguages[i])} onClick={this.handleChangeLanguage.bind(this, availableLanguages[i])} key={i}>{availableLanguages[i]}</a>
      );
    }
    
    return (
      <ul className="oo-popover-horizontal" role="menu">
        <li role="presentation">
          <div className="custom-cc-lang-block">
            {dataContentBlocks}
          </div>
          <OnOffSwitch
            {...this.props}
            ariaLabel={CONSTANTS.ARIA_LABELS.TOGGLE_CLOSED_CAPTIONS}
            role={CONSTANTS.ARIA_ROLES.MENU_ITEM_CHECKBOX} />
        </li>
      </ul>
    );
  }
});

// Extend with AccessibleMenu features
ClosedCaptionPopover = AccessibleMenu(ClosedCaptionPopover);

module.exports = ClosedCaptionPopover;
