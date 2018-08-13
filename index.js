//@flow

import React from "react"
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
  isOpenWifiSetting?: boolean,
  visible?: boolean,
  debound?: number,
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

export default class NetworkState extends React.PureComponent<Props> {

  static defaultProps = {
    isOpenWifiSetting: false,
    bottom: false,
    visible: true,
    debound: 1500,
    txtConnected: "Connected",
    txtDisconnected: "No Internet Connection",
    onConnected: () => { },
    onDisconnected: () => {
    }
  }

  state: State = {
    hidden: true,
    isConnected: true,
    type: "unknown",
    isFast: true
  }

  _TIMEOUT = null
  _listener: any = null

  constructor(props: Props) {
    super(props)
    const { onConnected, onDisconnected, debound } = this.props
    this._listener = RNNetworkStateEventEmitter.addListener(
      "networkChanged",
      (data: NetworkData) => {
        if (this.state.isConnected !== data.isConnected) {
          data.isConnected ? onConnected(data) : this.onDisconnected(data)
          this.setState({ ...data, hidden: false }, () => {
            var that = this;
            setTimeout(function () {
              that.setState({ hidden: true });
            }, debound);
          })
        }
      }
    )
  }
  onDisconnected(data) {
    const { isOpenWifiSetting, onDisconnected } = this.props
    if (isOpenWifiSetting) {
      Settings.openWifi();
    } else {
      onDisconnected(data);
    }
  }

  componentWillUnmount() {
    this._listener.remove()
  }

  render() {
    const {
      txtConnected,
      txtDisconnected,
      styleConnected,
      styleDisconnected,
      debound,
      visible,
      bottom,
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
// Props to use
// var propsNetwork = {
//   isOpenWifiSetting: true,
//   bottom: true,
//   debound:2000,
//   txtConnected: 'KHUONGND CONNECTED',
//   txtDisconnected: 'KHUONGND DISCONNECTED',
//   onDisconnected: (data) => { console.log('onDisconnected' + data) },
//   onConnected: () => { console.log('onConnected') },

