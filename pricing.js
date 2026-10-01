module.exports = {
  // Ticket tiers match the Supabase audience_tickets constraint.
  TICKET_PRICES: {
    adult: Number(process.env.PRICE_TICKET_ADULT || 200),
    couple: Number(process.env.PRICE_TICKET_COUPLE || 399),
    group4: Number(process.env.PRICE_TICKET_GROUP4 || 699),
  },
  VIDEO_UPSELL_PRICE_PER_BLOCK: Number(process.env.PRICE_VIDEO_UPSELL_BLOCK || 299),
  VIDEO_UPSELL_BLOCK_MINUTES: 5,
};
