module.exports = {
  TICKET_PRICES: {
    general: Number(process.env.PRICE_TICKET_GENERAL || 199),
    vip: Number(process.env.PRICE_TICKET_VIP || 399),
  },
  VIDEO_UPSELL_PRICE_PER_BLOCK: Number(process.env.PRICE_VIDEO_UPSELL_BLOCK || 299),
  VIDEO_UPSELL_BLOCK_MINUTES: 5,
};