/********************************************************************
  PLAYING SCREEN
*********************************************************************/
var React = require('react'),
    ReactDOM = require('react-dom'),
    ControlBar = require('../components/controlBar'),
    AdOverlay = require('../components/adOverlay'),
    ClassNames = require('classnames'),
    UpNextPanel = require('../components/upNextPanel'),
    Spinner = require('../components/spinner'),
    TextTrack = require('../components/textTrackPanel'),
    Watermark = require('../components/watermark'),
    ResizeMixin = require('../mixins/resizeMixin'),
    CONSTANTS = require('../constants/constants');
    ViewControlsVr = require('../components/viewControlsVr');

var PlayingScreen = React.createClass({
  mixins: [ResizeMixin],

  getInitialState: function() {
    this.isMobile = this.props.controller.state.isMobile;
    this.browserSupportsTouch = this.props.controller.state.browserSupportsTouch;

    return {
      controlBarVisible: true,
      timer: null
    };
  },

  componentDidMount: function () {
    //for mobile or desktop fullscreen, hide control bar after 3 seconds
    if (this.isMobile || this.props.fullscreen || this.browserSupportsTouch){
      this.props.controller.startHideControlBarTimer();
    }
  },

  componentWillUpdate: function(nextProps) {
    if(nextProps) {
      if (nextProps.controller.state.controlBarVisible == false && this.state.controlBarVisible == true) {
        this.hideControlBar();
      }
      if(!this.props.fullscreen && nextProps.fullscreen) {
        this.props.controller.startHideControlBarTimer();
      }
      if(this.props.fullscreen && !nextProps.fullscreen && this.isMobile) {
        this.setState({controlBarVisible: true});
        this.props.controller.showControlBar();
        this.props.controller.startHideControlBarTimer();
      }
    }
  },

  componentWillUnmount: function () {
    this.props.controller.cancelTimer();
  },

  handleResize: function() {
    if (this.isMounted()) {
      this.props.controller.startHideControlBarTimer();
    }
  },

  handleKeyDown: function(event) {
    console.log('BBB onKeyDown');
    // Show control bar when any of the following keys are pressed:
    // - Tab: Focus on next control
    // - Space/Enter: Press active control
    // - Arrow keys: Either seek forward/back, volume up/down or interact with focused slider
    switch (event.key) {
      case CONSTANTS.KEY_VALUES.TAB:
      case CONSTANTS.KEY_VALUES.SPACE:
      case CONSTANTS.KEY_VALUES.ENTER:
      case CONSTANTS.KEY_VALUES.ARROW_UP:
      case CONSTANTS.KEY_VALUES.ARROW_RIGHT:
      case CONSTANTS.KEY_VALUES.ARROW_DOWN:
      case CONSTANTS.KEY_VALUES.ARROW_LEFT:
        this.showControlBar();
        this.props.controller.startHideControlBarTimer();
        break;
      default:
        break;
    }
  },

  /**
   * The keydown event is not fired when the scrubber bar is first focused with
   * a tab unless playback was activated with a click. As a workaround, we make sure
   * that the control bar is shown when a control bar element is focused.
   *
   * @param {object} event Focus event object.
   */
  handleFocus: function(event) {
    var isControlBarElement = event.target || event.target.hasAttribute(CONSTANTS.KEYBD_FOCUS_ID_ATTR);
    // Only do this if the control bar hasn't been shown by now and limit to focus
    // events that are triggered on known control bar elements
    if (!this.state.controlBarVisible && isControlBarElement) {
      this.showControlBar();
      this.props.controller.startHideControlBarTimer();
      this.props.controller.state.accessibilityControlsEnabled = true;
    }
  },

  handleTouchEnd: function(event) {
    console.log('BBB onTouchEnd handleTouchEnd');
    event.preventDefault();//to prevent mobile from propagating click to discovery shown on pause
    if (!this.state.controlBarVisible){
      this.showControlBar(event);
      this.props.controller.startHideControlBarTimer();
    }
    else if (!this.props.controller.videoVr) {
      this.props.controller.togglePlayPause(event);
    }
  },

  handlePlayerMouseDown: function(e) {
    console.log('BBB onMouseDown handlePlayerMouseDown');
    this.props.handleVrPlayerMouseDown(e);
  },

  handlePlayerMouseMove: function(e) {
    console.log('BBB onMouseMove handlePlayerMouseMove');
    if(!this.isMobile && this.props.fullscreen) {
      this.showControlBar();
      this.props.controller.startHideControlBarTimer();
    }
    this.props.handleVrPlayerMouseMove(e);
  },

  handlePlayerMouseUp: function(e) {
    console.log('BBB onMouseUp handlePlayerMouseUp');
    // pause or play the video if the skin is clicked on desktop
    if (!this.isMobile) {
      e.stopPropagation(); // W3C
      e.cancelBubble = true; // IE
      this.props.controller.state.accessibilityControlsEnabled = true;
      if (!this.props.controller.videoVr) {
        this.props.controller.togglePlayPause();
      }
    }
    this.props.handleVrPlayerMouseUp();
    // for mobile, touch is handled in handleTouchEnd
  },

  handlePlayerMouseLeave: function () {
    console.log('BBB onMouseLeave handlePlayerMouseLeave');
    this.props.handleVrPlayerMouseLeave();
  },

  handlePlayerClicked: function (event) {
    if (!this.props.isVrMouseMove) {
      this.props.controller.togglePlayPause(event);
    }
    this.props.handleVrPlayerClick();
  },

  handlePlayerFocus: function() {
    this.props.handleVrPlayerFocus();
  },

  showControlBar: function(event) {
    console.log('BBB onMouseOver showControlBar 1');
    if (!this.isMobile || event.type == 'touchend') {
      console.log('BBB onMouseOver showControlBar 2');
      this.setState({controlBarVisible: true});
      this.props.controller.showControlBar();
      ReactDOM.findDOMNode(this.refs.PlayingScreen).style.cursor="auto";
    }
  },

  hideControlBar: function(event) {
    console.log('BBB onMouseOut hideControlBar 1');
    if (this.props.controlBarAutoHide == true && !(this.isMobile && event)) {
      console.log('BBB onMouseOut hideControlBar 2');
      this.setState({controlBarVisible: false});
      this.props.controller.hideControlBar();
      ReactDOM.findDOMNode(this.refs.PlayingScreen).style.cursor="none";
    }
  },

  render: function() {
    var adOverlay = (this.props.controller.state.adOverlayUrl && this.props.controller.state.showAdOverlay) ?
      <AdOverlay {...this.props}
        overlay={this.props.controller.state.adOverlayUrl}
        showOverlay={this.props.controller.state.showAdOverlay}
        showOverlayCloseButton={this.props.controller.state.showAdOverlayCloseButton}/> : null;

    var upNextPanel = (this.props.controller.state.upNextInfo.showing && this.props.controller.state.upNextInfo.upNextData) ?
      <UpNextPanel {...this.props}
        controlBarVisible={this.state.controlBarVisible}
        currentPlayhead={this.props.currentPlayhead}/> : null;

    var viewControlsVr = this.props.controller.videoVr ?
      <ViewControlsVr
        {...this.props}
        controlBarVisible={this.state.controlBarVisible}
      /> : null;

    return (
      <div
        className="oo-state-screen oo-playing-screen"
        ref="PlayingScreen"
        onMouseOver={this.showControlBar}
        onMouseOut={this.hideControlBar}
        onKeyDown={this.handleKeyDown}
      >
        <div
          className="oo-state-screen-selectable"
          onMouseDown={this.handlePlayerMouseDown}
          onMouseUp={this.handlePlayerMouseUp}
          onMouseMove={this.handlePlayerMouseMove}
          onSelect={function(){return false;}}
          onMouseLeave={this.handlePlayerMouseLeave}
          onTouchEnd={this.handleTouchEnd}
          onClick={this.handlePlayerClicked}
          onFocus={this.handlePlayerFocus}
        />

      <Watermark {...this.props} controlBarVisible={this.state.controlBarVisible}/>

      {this.props.controller.state.buffering ? <Spinner loadingImage={this.props.skinConfig.general.loadingImage.imageResource.url}/> : null}

        {viewControlsVr}

        <div className="oo-interactive-container" onFocus={this.handleFocus}>

        {this.props.closedCaptionOptions.enabled ?
          <TextTrack
            closedCaptionOptions={this.props.closedCaptionOptions}
            cueText={this.props.closedCaptionOptions.cueText}
            responsiveView={this.props.responsiveView}
          /> : null
        }

        {adOverlay}

        {upNextPanel}

        <ControlBar {...this.props}
          controlBarVisible={this.state.controlBarVisible}
          playerState={this.props.playerState}
          isLiveStream={this.props.isLiveStream} />
      </div>
    </div>
    );
  }
});
module.exports = PlayingScreen;
