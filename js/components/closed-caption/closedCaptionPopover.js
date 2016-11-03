var React = require('react'),
    CONSTANTS = require('../../constants/constants'),
    Utils = require('../utils'),
    OnOffSwitch = require('./onOffSwitch'),
    ClassNames = require('classnames'),
    CloseButton = require('../closeButton');

var ClosedCaptionPopover = React.createClass({

  handleMoreCaptions: function() {
    this.props.controller.toggleScreen(CONSTANTS.SCREEN.CLOSEDCAPTION_SCREEN);
    this.handleClose();
  },

  handleClose: function() {
    this.props.togglePopoverAction();
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
      <ul className="oo-popover-horizontal">
        <div className="custom-cc-lang-block">
            {dataContentBlocks}
        </div>
        <OnOffSwitch {...this.props} />
      </ul>
    );
  }
});

module.exports = ClosedCaptionPopover;