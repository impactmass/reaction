import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";

Meteor.methods({
  "authKeycloak"(options) {
    check(options, Object);

    if (!Reaction.hasPermission()) {
      return false;
    }
    // make token available for subsequent method cals
    this.setUserId(options.refAccountId);
    return true;
  }
});
