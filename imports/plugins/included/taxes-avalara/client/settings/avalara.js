import _ from "lodash";
import { Template } from "meteor/templating";
import { Tracker } from "meteor/tracker";
import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Countries } from "/client/collections";
import { Reaction, i18next } from "/client/api";
import { Packages, Logs } from "/lib/collections";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";


Template.avalaraSettings.onCreated(function () {
  const handle = Meteor.subscribe("Logs");
  Tracker.autorun(() => {
    const isReady = handle.ready();
    console.log(`Handle is ${isReady ? "ready" : "not ready"}`);
  });
});


Template.avalaraSettings.helpers({
  packageConfigSchema() {
    return AvalaraPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "taxes-avalara",
      shopId: Reaction.getShopId()
    });
  },
  countryOptions() {
    // Avalara supports only Canada and US for address validation
    return Countries.find({ value: { $in: ["US", "CA"] } }).fetch();
  }
});

Template.avalaraSettings.events({
  "click [data-event-action=testCredentials]": function (event) {
    event.preventDefault();
    event.stopPropagation();
    const formData = AutoForm.getFormValues("avalara-update-form");
    const settings = _.get(formData, "insertDoc.settings.avalara");

    Meteor.call("avalara/testCredentials", settings, function (error, result) {
      const statusCode = _.get(result, "statusCode");
      const connectionValid = _.inRange(statusCode, 400);
      if (connectionValid) {
        return Alerts.toast("Connection Test Success", "success"); // TODO i18n
      }
      return Alerts.toast("Connection Test Failed, Check credentials", "error"); // TODO i18n
    });
  }
});

AutoForm.hooks({
  "avalara-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.taxSettings.shopTaxMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.taxSettings.shopTaxMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
