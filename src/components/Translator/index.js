import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import { actionContextTypes } from "@protonapp/proton-runner/lib/utils/actions";
import { connect } from "react-redux";

/** Based on shakhal/find_values.js */
function searchAndUpdate(obj, translations) {
  if (!obj) { return; }
  if (obj instanceof Array) {
    for (var i in obj) {
      searchAndUpdate(obj[i], translations)
    }
    return
  }
  if (obj.text && typeof obj.text === "string") {
    obj.text = translations[obj.text]
  }
  if (obj.placeholder && typeof obj.placeholder === "string") {
    obj.placeholder = translations[obj.placeholder]
  }
  if (obj.label && typeof obj.label === "string") {
    obj.label = translations[obj.label]
  }

  if ((typeof obj === "object") && (obj !== null)) {
    var children = Object.keys(obj)
    if (children.length > 0) {
      for (i = 0; i < children.length; i++) {
        searchAndUpdate(obj[children[i]], translations)
      }
    }
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
          searchAndUpdate(object, translations)
        );
        screen.layout.fixed.forEach((object) =>
          searchAndUpdate(object, translations)
        );
        screen.objects.forEach((object) =>
        searchAndUpdate(object, translations)
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
