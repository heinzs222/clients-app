import { __testing } from "../netlify/functions/_payment-credit.mjs";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

process.env.LEMONSQUEEZY_STORE_ID = "1219606";
process.env.LEMONSQUEEZY_VARIANT_ID = "1906603";
process.env.CAPI_ENDPOINT_PRICE_CENTS = "500";
process.env.LEMONSQUEEZY_TEST_MODE = "false";

const user = { email: "owner@example.com" };
const paidOrder = {
  id: "123456",
  attributes: {
    user_email: user.email,
    store_id: 1219606,
    first_order_item: { variant_id: 1906603 },
    status: "paid",
    refunded: false,
    refunded_amount: 0,
    subtotal: 500,
    currency: "USD",
    test_mode: false,
    created_at: "2026-07-24T00:00:00.000Z"
  }
};

assert(__testing.validateOrder(paidOrder, user).orderId === "123456", "A valid $5 order was rejected.");
assert(__testing.checkoutOrderId("123456") === "123456", "Valid order ID normalization failed.");
assert(!__testing.checkoutOrderId("../123"), "Unsafe order ID was accepted.");

for (const [label, mutate] of [
  ["another account", (order) => { order.attributes.user_email = "other@example.com"; }],
  ["wrong amount", (order) => { order.attributes.subtotal = 1000; }],
  ["refund", (order) => { order.attributes.refunded = true; }],
  ["unpaid status", (order) => { order.attributes.status = "pending"; }],
  ["wrong mode", (order) => { order.attributes.test_mode = true; }]
]) {
  const order = structuredClone(paidOrder);
  mutate(order);
  let rejected = false;
  try {
    __testing.validateOrder(order, user);
  } catch {
    rejected = true;
  }
  assert(rejected, `Payment validation accepted ${label}.`);
}

console.log("Validated shared $5 conversion-credit ownership and payment rules.");
