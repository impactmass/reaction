import { compose } from "recompose";
import { composeWithTracker, registerComponent, withPermissions } from "@reactioncommerce/reaction-components";
import OrderSearch from "../components/orderSearch";
import { Meteor } from "meteor/meteor";
import { OrderSearch as OrderSearchCollection } from "/lib/collections";

const handlers = {
  /**
   * handleChange - handler to call onchange of search input
   * @param {string} event - event object
   * @param {string} value - current value of the search input
   * @return {null} -
   */
  handleChange(event, value) {
    this.setState({ query: value });

    if (this.props.handleChange) {
      this.props.handleChange(value);
    }
  },

  /**
   * handleClear - handler called onclick of search clear text
   * @return {null} -
   */
  handleClear() {
    this.setState({ query: "" });

    if (this.props.handleChange) {
      this.props.handleChange("");
    }
  }
};

const composer = (props, onData) => {
  console.log({ props });
  const subscription = Meteor.subscribe("SearchResults", "orders", props.searchQuery);
  let orderSearchResultsIds;

  if (subscription.ready()) {
    const orderSearchResults = OrderSearchCollection.find().fetch();
    const query = props.query;
    orderSearchResultsIds = orderSearchResults.map(orderSearch => orderSearch._id);
    // checking to ensure search was made and search results are returned
    if (props.searchQuery && Array.isArray(orderSearchResultsIds)) {
      // add matching results from search to query passed to Sortable
      query._id = { $in: orderSearchResultsIds };
      console.log("new query is", query);
      if (props.handleUpdate) {
        props.handleUpdate({ query: query });
        // return this.setState({ query: query });
      }
    }
    // being here means no search text is inputed or search was cleared, so reset any previous match
    delete query._id;
    console.log("new query is", query);
    if (props.handleUpdate) {
      // return this.setState({ query: query });
      props.handleUpdate({ query: query });
    }

    onData(null, {});
  }
};

registerComponent("OrderSearch", OrderSearch, [
  composeWithTracker(composer),
  withPermissions({ roles: ["orders"] })
]);

export default compose(
  composeWithTracker(composer),
  withPermissions({ roles: ["orders"] })
)(OrderSearch);
