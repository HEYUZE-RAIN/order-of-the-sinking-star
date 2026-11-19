/** 区域攻略英文版 · 第三批（西境 / Promesst） */
module.exports = {
  promesst1_and_2: {
    w: "Vault of the Beamcasters: the opening caves of the west, teaching that gems are both battery and cargo. Collect gems to power emitters; stand in the beam to gain that beam's ability.",
    tips: [
      "Work out which gem is keeping the current passage lit before moving any of them.",
      "Removing a gem cuts the path instantly — have a temporary tile ready first.",
      "Yellow shatters, green pierces walls; those are the two basics here, don't rush ahead."
    ]
  },
  promesst3: {
    w: "Alter Beam: the deep west, asking you to light several paths at once. There is always one gem fewer than you'd like.",
    tips: [
      "Decide what ability the exit needs, then work backwards to the light source.",
      "One gem usually powers two devices; carrying it along on cyan is standard.",
      "Cut the beam and the hero loses the ability — never attempt an ability move while dark."
    ]
  },
  gems: {
    w: "Gems: battery and cargo at once. Take one and the passage dims; set it down and the ability arrives.",
    tips: [
      "Find the gem holding the current path before you dismantle anything lit.",
      "Decide the drop spot before picking up; with no free hand, don't take it.",
      "Gems stack on one emitter; extra gems just extend the power."
    ]
  },
  beaming_objects: {
    w: "Beams and Objects: not everything reacts to light. Objects block, reflect or pass it, each useful.",
    tips: [
      "Check whether an object blocks or passes light first; guess wrong and the whole path is wasted.",
      "A light-blocking object makes a fine switch — faster than hunting for a button.",
      "Mirrors can be pushed; moving the source beats rewiring."
    ]
  },
  beam_carrying: {
    w: "Carrying Beams: the beam itself can be hauled — via movable emitters or mirror faces — to send light into the distance.",
    tips: [
      "Fix the endpoint, then find the shortest light path.",
      "Emitters can be pushed; don't treat them as fixed furniture.",
      "Long runs usually need a relay mirror — set it up in advance."
    ]
  },
  double_beam_falling: {
    w: "Double Beam Falling: under two beams at once a hero gains two abilities at the same time — and can be pushed downward.",
    tips: [
      "Two abilities at once changes the movement rules; test one step before planning.",
      "A falling beam turns a platform into an elevator — don't stand on the edge.",
      "Cutting one beam is often simpler than tuning two."
    ]
  },
  double_beam_falling_dropdown: {
    w: "Double Beam Falling and Drops: add a height gap and the same beam behaves differently per floor.",
    tips: [
      "Confirm the light path on the lower floor before heading up.",
      "A beam column at a drop works as a relay — no need to detour.",
      "Falling from height resets your position; don't gamble on a critical step."
    ]
  },
  sideways_gates: {
    w: "Sideways Gates: a gate only opens one way, so push direction decides whether you get through.",
    tips: [
      "You must push from the gate's front face; the side just hits the wall.",
      "Gates cycle with a delay, so hero and crate cross in two trips.",
      "Jam a stone in the gate to keep a way back."
    ]
  },
  flat_things: {
    w: "Flat Things: thin sheets you can cross from above but not push. They're usually beam baffles.",
    tips: [
      "Flat things block light but not people — know which you're dealing with.",
      "Turn a sheet to an angle and the beam finds its way.",
      "Don't shove them into a corner; you'll have to come back for them."
    ]
  },
  sky_promesst_misc: {
    w: "Sky Promises: scattered rooms up high. No new mechanics, but the landing spots are very narrow.",
    tips: [
      "Read the edges first; slow beats fast up here.",
      "Sky rooms lean on the purple dash — confirm a landing before you launch.",
      "Falling drops you a floor; the cost is low, so experiment."
    ]
  },
  vertical_promesst: {
    w: "Vertical Promises: beams travel vertically, so mirrors must lie flat to catch them.",
    tips: [
      "In a shaft, look for horizontal mirrors, not angled ones.",
      "With light rising from below, stand in the column and ride it up.",
      "Push the gem to the shaft's base; easier than finding power at the top."
    ]
  },
  vertical_endpoint: {
    w: "Vertical Endpoints: the beam ends in mid-air and the purple dash sends you straight through it.",
    tips: [
      "Place a stone or gem at the end as a cushion before dashing.",
      "With nothing at the end, take the long way rather than launching.",
      "The light path cuts behind you after the dash — plan the return separately."
    ]
  },
  zachtronics: {
    w: "Beam Computation: community-designed open-ended rooms. More than one solution usually works, but efficiency varies wildly.",
    tips: [
      "Find a dumb working solution first, then shorten it.",
      "These rooms allow unlimited retries; don't chase optimal on the first pass.",
      "Treat step count as a score; the second attempt usually halves it."
    ]
  },
};
