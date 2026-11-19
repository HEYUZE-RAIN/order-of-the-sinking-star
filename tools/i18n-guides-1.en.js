/** 区域攻略英文版：分批写入，最后由 build-i18n.js 合并。 */
module.exports = {
  underworld_crossroads: {
    w: "Crossroads Low: the hub where all four main paths meet underground, and the layer most players overlook. Baffling dead ends above often only connect once you drop down here.",
    tips: [
      "Walk all four exits downstairs first; remember which one leads to which main path.",
      "The same path upstairs and downstairs isn't always connected — don't trust a flat-map instinct.",
      "Usually just one level here, but it's the gate to most of the underground."
    ]
  },
  skipping_stones: {
    w: "Skipping Stones: push a stone across the water and it skips to the nearest shore. Force doesn't matter — only direction.",
    tips: [
      "The landing spot is fixed, so the real puzzle is who's standing next to it.",
      "With no landing spot the stone sinks and leaves shallow water you can walk on — that's not a failure.",
      "Stones can collide and link into a bridge; don't think in single crossings.",
      "The south is a series: the stone you leave behind is the premise of the next level."
    ]
  },
  lily_rotation: {
    w: "Lily Rotation: ripples from a skipping stone carry the lily pads. Want a pad to move right? Push the stone left.",
    tips: [
      "Every throw reshapes the terrain — check where the pad will drift before you move.",
      "Let the pad settle before throwing the next stone, or it overshoots.",
      "Pads are moving platforms; treat them as tiles that walk."
    ]
  },
  underworld_lilies: {
    w: "Underground Lilies: no sunlight down here, so pads only follow the undercurrent. Direction is the whole difficulty.",
    tips: [
      "Follow the water once to learn the current before acting.",
      "There's no retreat underground — make sure you can come back before throwing.",
      "Jamming the flow with a stone beats pushing against it."
    ]
  },
  intro_to_3d: {
    w: "Intro to the Third Dimension: from flat tiles into real space. Lesson one is that the same tile at two heights is two different things.",
    tips: [
      "Rotate the camera to read the floors before touching anything.",
      "Going up isn't always stairs — sometimes it's a beam.",
      "Falling in the 3D areas usually just drops you a floor; the cost is low."
    ]
  },
  heroes_in_3d: {
    w: "Heroes and Depth: six heroes in three dimensions, where every push and swap has a height. With this many actors, switching is the main cost.",
    tips: [
      "Switch with the digit keys, not by clicking.",
      "Place the one-trick heroes first, then move Valens.",
      "A push across a height gap can drop the object a floor — check first."
    ]
  },
  skipping_in_3d: {
    w: "Skipping and Depth: skipping stones land on platforms at different heights, so the landing check becomes three-dimensional.",
    tips: [
      "Read the target platform's height before choosing where to throw.",
      "A drop carries the stone farther — don't estimate by flat distance.",
      "Pads cross layers in 3D, which makes them natural elevators."
    ]
  },
  clones: {
    w: "Clones: a mirrored copy of you acts independently and can be spent. This area is about division of labour.",
    tips: [
      "A copy can't stray far from its light path; cut the light and it's gone.",
      "Send the copy to hold switches, keep yourself free to reposition.",
      "The copy is expendable, you are not — decide who takes the risk."
    ]
  },
  spawners: {
    w: "Spawners: devices that keep producing objects. The question stops being whether you have enough and becomes whether the room fills up.",
    tips: [
      "Measure the spawn rate before deciding to block the output.",
      "Spawned objects work as stepping stones or as bomb fuel.",
      "Pile up too much and you trap yourself — leave a corridor."
    ]
  },
  endgame1: {
    w: "Ending 1: the room behind the first ending. You only need any 4 gold-room teleporters to get here, not a full clear.",
    tips: [
      "This is the early-exit ending — you don't need to clear the whole map.",
      "Before entering, re-confirm the basic action of all four worlds.",
      "Usually a single combined action; don't overthink it."
    ]
  },
  endgame2: {
    w: "Ending 2: the second ending, asking for a deeper world collision. All four mechanics must be right at once.",
    tips: [
      "Split it into four independent sub-problems, then recombine.",
      "Each sub-problem uses the most basic move of its world.",
      "If stuck, step back to the previous sub-problem instead of forcing the whole."
    ]
  },
  endgame3: {
    w: "Ending 3: the deepest tier, a 40-room finale set. No new mechanics — just the one rule you haven't really understood yet.",
    tips: [
      "In each room, ask which ruleset it's testing.",
      "Old actions mean something new in a new setting — re-read the rules.",
      "You're allowed to skip rooms; the finale doesn't require order."
    ]
  },
};
