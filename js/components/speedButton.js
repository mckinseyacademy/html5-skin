var React = require('react');

var SpeedButton = React.createClass({
  getInitialState: function() {
    return {speed: 1}
  },
  increaseSpeed: function() {
    var videoElement = this.props.controller.state.mainVideoElement;
    var speed = this.state.speed;

    if(videoElement){
      speed = (speed == 2) ? 1 : speed + 0.5;
      videoElement.playbackRate = speed;
      this.setState({speed: speed});
      this.props.controller.renderSkin();
    }
  },
  render: function(){
    return (
      <div onClick={this.increaseSpeed} className="oo-playback-speed-container">
        <a className="oo-playback-speed custom-control-bar-item">
          <span className="oo-icon">{this.state.speed}x</span>
        </a>
      </div>
    )
  }
});

module.exports = SpeedButton;
