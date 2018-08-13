import React, { Component } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  NetInfo,
  ViewProperties,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
  Platform
} from "react-native"

type Props = {
  bottom?: boolean,
  visible?: boolean,
  debound?: number,
  timeOut?: number,
  txtConnected?: string,
  txtDisconnected?: string,
  styleConnected?: Object | Number,
  styleDisconnected?: Object | Number,
  onConnected?: Function,
  onDisconnected?: Function,
  ...ViewProperties
}

type State = {
  isConnected: boolean,
  type: string,
  isFast: boolean,
  hidden: boolean
}
type NetworkData = {
  isConnected: boolean,
  type: string,
  isFast: boolean
}

export const Settings = NativeModules.RNNetworkState
const RNNetworkStateEventEmitter = new NativeEventEmitter(Settings)

export default class NetworkState extends Component {
  static defaultProps = {
    visible: true,
    bottom: false,
    debound: 1500,
    timeOut: 2000,
    txtConnected: "Connected",
    txtDisconnected: "No Internet Connection",
    onConnected: () => { },
    onDisconnected: () => { }
  }

  state: State = {
    hidden: true,
    isConnected: true,
    type: "unknown",
    isFast: true
  }
  _listener: any = null

  constructor(props: Props) {
    super(props)

    const { onConnected, onDisconnected, timeOut } = this.props
    this._listener = RNNetworkStateEventEmitter.addListener(
      "networkChanged",
      (data) => {
        if (this.state.isConnected !== data.isConnected) {
          data.isConnected ? onConnected(data) : onDisconnected(data)
          this.setState({ ...data, hidden: false }, () => {
            var that = this;
            setTimeout(function () { that.setState({ hidden: true }) }, timeOut);
          })
        }
      }
    )
  }

  componentWillUnmount() {
    this._listener.remove()
  }
  openWifiSetting(){
    Settings.openWifi();
  }
  render() {
    const {
      bottom,
      txtConnected,
      txtDisconnected,
      styleConnected,
      styleDisconnected,
      debound,
      visible,
      ...viewProps
    } = this.props

    if (this.state.visible && this.state.isConnected) {
      this._TIMEOUT && clearTimeout(this._TIMEOUT)
      this._TIMEOUT = setTimeout(() => {
        this.setState({ hidden: true })
      }, debound)
    }
    if (this.state.hidden || !visible) {
      return <View />
    }
    return (
      <View style={bottom ? styles.containerBottom : styles.containerTop} {...viewProps}>
        <Text
          style={[
            this.state.isConnected ? styles.txtSuccess : styles.txtError,
            this.state.isConnected && styleConnected && styleConnected,
            !this.state.isConnected && styleDisconnected && styleDisconnected
          ]}
        >
          {this.state.isConnected
            ? txtConnected || "Connected"
            : txtDisconnected || "No Internet Connection"}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  containerBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        marginTop: 20
      }
    })
  },
  containerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        marginTop: 20
      }
    })
  },
  txtSuccess: {
    paddingVertical: 5,
    color: "#fff",
    backgroundColor: "#4caf50",
    textAlign: "center"
  },
  txtError: {
    paddingVertical: 5,
    color: "#fff",
    backgroundColor: "#f44336",
    textAlign: "center"
  }
})
 // var propsNetwork = {
    //   bottom: true,
    //   txtConnected: 'KHUONGND CONNECTED',
    //   txtDisconnected: 'KHUONGND DISCONNECTED',
    //   visible:false,
    //   timeOut: 5000,
    //   onDisconnected: () => {
    //     console.log('onDisconnected'),
    //     this.refs.network.openWifiSetting()
    //   },
    //   onConnected: () => { console.log('onConnected') },
    // }