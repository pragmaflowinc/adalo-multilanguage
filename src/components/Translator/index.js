import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import { actionContextTypes } from "@protonapp/proton-runner/lib/utils/actions";
import { connect } from "react-redux";

function recursiveChildSearchAndUpdate(node, translations) {
  if (node.attributes) {
    if (
      typeof node.attributes.text === "string" &&
      translations[node.attributes.text]
    ) {
      node.attributes.text = translations[node.attributes.text];
    }
    (node.children || []).forEach((child) =>
      recursiveChildSearchAndUpdate(child, translations)
    );
  }
}

class DeepLinking extends Component {
  static contextTypes = {
    ...actionContextTypes,
  };

  constructor(props) {
    super(props);
    this._updateTranslation = this._updateTranslation.bind(this);
  }

  _updateTranslation() {
    if (this.props.translationTable) {
      const translations = this.props.translationTable.reduce((acc, t) => {
        acc[t.translationKey] = t.translationText;
        return acc;
      }, {});
      Object.keys(global.app.components).forEach((key) => {
        const screen = global.app.components[key];
        screen.layout.body.forEach((object) =>
          recursiveChildSearchAndUpdate(object, translations)
        );
        screen.layout.fixed.forEach((object) =>
          recursiveChildSearchAndUpdate(object, translations)
        );
        screen.objects.forEach((object) =>
          recursiveChildSearchAndUpdate(object, translations)
        );
      });
      if (this.props.loadingComplete) {
        this.props.loadingComplete();
      }
    }
  }

  componentDidUpdate() {
    if (this.props.translationTable && global.translationLoaded === undefined) {
      this._updateTranslation();
      global.translationLoaded = true;
    }
  }

  componentDidMount() {
    if (global.app === undefined) {
      const { getApp } = this.context;
      let app = getApp();
      global.app = app;
    }
  }

  render() {
    return <View />;
  }
}

const mapStateToProps = (state) => ({
  state,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

const ConnectedDeepLinking = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeepLinking);

const Translator = (props) => {
  const { color, text, editor } = props;
  if (editor) {
    return (
      <View style={styles.wrapper}>
        <Text>Translations installed</Text>
      </View>
    );
  }
  return <ConnectedDeepLinking {...props} />;
};

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Translator;
