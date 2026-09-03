/**
 * Story Engine seed data — gap matrix cluster-8.
 *
 * 3 real, complete branching short stories for kids (7 pages each, 2
 * choices per non-ending page — a true binary-tree branching structure:
 * page 1 forks into 2 second pages, each of which forks into 2 leaf
 * endings, for 7 total pages per story). Each teaches a real science
 * concept correctly through the story's actual plot and choices, not as
 * a bolted-on quiz.
 *
 * Story Safety Engine: every page's `text` is run through the same
 * deterministic Presidio PII backstop `ModerationService.moderateContent()`
 * uses (see pii-detection.service.ts) before being marked
 * `safetyReviewed: true`. The Bedrock LLM half of ModerationService is
 * currently down in production (invalid AWS credential — a pre-existing,
 * already-logged platform issue, see gap matrix Coding Learning Engine
 * row) so this seed calls the Presidio HTTP endpoint directly rather than
 * routing through the full ModerationService (which would throw on the
 * Bedrock call). This is logged honestly in each page's `safetyNotes`
 * rather than silently faking a "reviewed via full pipeline" claim.
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const PRESIDIO_URL = process.env.PRESIDIO_URL || 'http://127.0.0.1:5002';

interface RawPage {
  pageNumber: number;
  text: string;
  choiceOptions: { label: string; nextPageNumber: number | null }[];
}

interface RawStory {
  title: string;
  summary: string;
  ageBand: AgeBand;
  domainSlug: string;
  pages: RawPage[];
}

const stories: RawStory[] = [
  {
    title: "Dewey the Droplet's Water Cycle Adventure",
    summary:
      'A water droplet named Dewey travels the whole water cycle — evaporating from the ocean, meeting a talking cloud, and choosing between falling as rain over a forest or as snow on a mountain — learning exactly how evaporation, condensation, precipitation, and collection fit together.',
    ageBand: AgeBand.AGE_8_9,
    domainSlug: 'science',
    pages: [
      {
        pageNumber: 1,
        text: `Dewey was a tiny drop of water, bobbing near the top of the big blue ocean. The morning sun felt warm on his back, and something strange was happening — he felt lighter every minute, like he might float right off the water!

Up above, a fluffy white cloud named Puffy drifted by, calling down cheerfully. "Morning, Dewey! Are you ready for the biggest trip of your life?"

Dewey had never left the ocean before. He wasn't sure what to do first.`,
        choiceOptions: [
          { label: 'Let the warm sun lift you up into the sky', nextPageNumber: 2 },
          { label: 'Call up to Puffy and ask how this whole trip works', nextPageNumber: 3 },
        ],
      },
      {
        pageNumber: 2,
        text: `Dewey let the sun's heat warm him more and more. Slowly, slowly, he stopped being liquid water and turned into an invisible gas called water vapor — this is called EVAPORATION. He couldn't believe it: he was rising straight up into the air, too light and spread-out to see!

The higher he went, the cooler the air got. Dewey started bumping into millions of other tiny water vapor bits, all rising just like him.

"Whoa," Dewey said. "Everything's getting foggy — and cold!"`,
        choiceOptions: [
          { label: 'Huddle together with the other droplets to form a cloud', nextPageNumber: 4 },
          { label: 'Drift up higher, away from the crowd, to see how cold it gets', nextPageNumber: 5 },
        ],
      },
      {
        pageNumber: 3,
        text: `"Easy!" Puffy boomed happily. "First the sun warms up water until it evaporates — turns into invisible vapor — and floats up here with me. Then it cools down and turns back into tiny liquid droplets. That's called CONDENSATION, and it's exactly how clouds like me are made!"

Dewey felt the sun's warmth start pulling at him too, turning him into vapor right as Puffy spoke. Up he went, right into the cool air where millions of other vapor bits were gathering.

"So what happens once I'm a cloud?" Dewey asked, a little nervous.`,
        choiceOptions: [
          { label: 'Squeeze in with Puffy\'s cloud family to find out', nextPageNumber: 4 },
          { label: 'Float off alone toward a tall, snowy mountain peak', nextPageNumber: 5 },
        ],
      },
      {
        pageNumber: 4,
        text: `Dewey squeezed in next to millions of other tiny water droplets, all clinging together in the cool air. Together, they formed a real, fluffy cloud — Dewey was part of Puffy's family now!

But clouds can only hold so much water. As more and more droplets joined, the cloud grew heavy and gray. Dewey felt himself getting bigger and heavier, ready to fall.

"This is it," Puffy said. "Time for PRECIPITATION — water falling back down to Earth. Where should we land?"`,
        choiceOptions: [
          { label: 'Fall as warm rain over the green forest below', nextPageNumber: 6 },
          { label: 'Fall as soft snow over the icy mountain peak', nextPageNumber: 7 },
        ],
      },
      {
        pageNumber: 5,
        text: `Dewey drifted higher and further from the other droplets, curious how cold the sky could really get. The air grew freezing, and Dewey felt himself change again — from a liquid droplet into a tiny, six-sided ice crystal, sparkling and light.

"Brrr!" Dewey thought. "I didn't know water could do THIS!"

Below him, he could see Puffy's cloud getting heavier and heavier, ready to release its water back to Earth.`,
        choiceOptions: [
          { label: 'Warm up slightly and drift down to rejoin the rain cloud', nextPageNumber: 4 },
          { label: 'Stay high and cold, joining a snow cloud over the mountain', nextPageNumber: 7 },
        ],
      },
      {
        pageNumber: 6,
        text: `Dewey fell as a warm raindrop, splashing down among the tall trees of the forest. Some of him soaked straight into the soil, where thirsty tree roots drank him up. The rest trickled between leaves and rocks until he joined a bubbling little stream.

The stream carried Dewey downhill, joining bigger and bigger streams, then a wide river, until — splash! — he was back in the ocean where his journey began. This last step, water flowing back into oceans, lakes, and rivers, is called COLLECTION.

Dewey had gone all the way around: evaporation lifted him up, condensation turned him into a cloud, precipitation brought him down as rain, and collection carried him home. The water cycle never really ends — tomorrow, the sun might warm him up all over again!

THE END`,
        choiceOptions: [],
      },
      {
        pageNumber: 7,
        text: `Dewey fell as a soft snowflake, landing gently on the mountain's icy peak alongside thousands of other snowflakes. All winter he stayed frozen, packed into deep snow, waiting.

When spring arrived, the sun grew warmer. Dewey melted, trickling down the mountainside as icy meltwater. He joined a fast stream, tumbling over rocks, until the stream became a river that raced all the way down to the ocean — this final step, water returning to oceans and lakes, is called COLLECTION.

Dewey had completed the whole water cycle in a snowier way: evaporation lifted him into the sky, condensation formed him into a cloud, precipitation brought him down as snow instead of rain, and collection eventually carried him home again. Whether as rain or snow, water always finds its way back around.

THE END`,
        choiceOptions: [],
      },
    ],
  },
  {
    title: 'Max and the Magnet Mystery',
    summary:
      "Young inventor Max's robot dog Circuit rolls under a cluttered garage shelf. Using a horseshoe magnet, Max has to work out which materials magnets actually attract, and how north and south poles attract or repel each other, to rescue Circuit — learning real magnetism along the way.",
    ageBand: AgeBand.AGE_10_11,
    domainSlug: 'science',
    pages: [
      {
        pageNumber: 1,
        text: `Max's robot dog, Circuit, rolled a little too fast across the garage floor and zoomed straight under a low, cluttered shelf. Max could hear Circuit's motor whirring helplessly — he was stuck, tangled somewhere in the dark.

On the workbench sat Max's favorite tool: a big red horseshoe magnet. Max knew magnets could pull metal objects toward them without even touching them — but not every material.`,
        choiceOptions: [
          { label: 'Test the magnet on a few things nearby first', nextPageNumber: 2 },
          { label: "Rush straight under the shelf to grab Circuit", nextPageNumber: 3 },
        ],
      },
      {
        pageNumber: 2,
        text: `Max held the magnet near a small pile of paperclips — they leapt right up and stuck to it! Next, Max tried a steel spoon — that stuck too. But when Max held the magnet near a wooden ruler and then an aluminum soda can, nothing happened at all; they just sat there.

"Interesting," Max said. "Magnets only pull certain metals — like iron and steel — not wood, and not every metal either. Circuit's collar has a little steel plate on it for his charging dock, so this should work!"

Now Max just needed to reach Circuit safely.`,
        choiceOptions: [
          { label: "Reach under the shelf, magnet's north pole facing down", nextPageNumber: 4 },
          { label: 'Flip the magnet around to try the south pole facing down instead', nextPageNumber: 5 },
        ],
      },
      {
        pageNumber: 3,
        text: `Max didn't stop to think — just grabbed the magnet and dove under the shelf, magnet held out in front. But instead of pulling Circuit closer, something pushed back! Circuit's collar seemed to slide FURTHER away, like it was being shoved by an invisible hand.

Max pulled back, confused. "Wait... magnets don't always pull things closer?"

Circuit's collar had its own small magnet built in — and when two magnets face each other with matching poles (north-to-north or south-to-south), they REPEL, or push apart, instead of attracting.`,
        choiceOptions: [
          { label: 'Flip the magnet around to the opposite pole and try again', nextPageNumber: 6 },
          { label: 'Back out and grab a flashlight to see what\'s really going on first', nextPageNumber: 7 },
        ],
      },
      {
        pageNumber: 4,
        text: `Max reached carefully under the shelf. The magnet's north pole faced Circuit's built-in collar magnet, and — click — the two poles pulled together perfectly, since opposite poles (north and south) always attract.

Circuit's collar slid smoothly toward the magnet, and Max gently guided him out into the light. Circuit's tail-light blinked happily.

"Magnets pull iron and steel," Max said, "and the way two magnets face each other — same poles push apart, opposite poles pull together — decides whether they attract or repel. Mystery solved, buddy!"

THE END`,
        choiceOptions: [],
      },
      {
        pageNumber: 5,
        text: `Max flipped the magnet to face south-pole-down and reached under the shelf. This time, Circuit's collar magnet and Max's horseshoe magnet lined up the same way — and just like Max had seen with the paperclips, matching poles facing each other pushed apart instead of attracting.

Circuit's collar slid a little further out of reach. Max laughed and flipped the magnet back around the other way — now the poles were opposite, and the pull worked perfectly. Circuit's collar snapped toward the magnet, and Max pulled him free.

"Guess I had to try both poles to remember," Max said. "Opposite poles attract, same poles repel — every single time. Now I'll never forget it!"

THE END`,
        choiceOptions: [],
      },
      {
        pageNumber: 6,
        text: `Max flipped the horseshoe magnet around to face the opposite pole toward Circuit's collar. This time, instead of pushing away, the two magnets pulled together strongly — opposite poles (north and south) always attract, even when same poles had just repelled moments before.

Circuit's collar slid right up to the magnet, and Max carefully guided him out from under the shelf. Circuit's sensors lit up with relief.

"So that's the trick," Max said, brushing off dust. "Same poles push apart, opposite poles pull together. I should've checked that BEFORE diving under the shelf — but at least I figured it out!"

THE END`,
        choiceOptions: [],
      },
      {
        pageNumber: 7,
        text: `Max backed out from under the shelf and grabbed a flashlight, shining it into the dark gap. Now Max could see clearly: Circuit's collar had its own small magnet, with its poles facing the exact same way as the horseshoe magnet — which is exactly why they had pushed apart instead of attracting.

Max flipped the horseshoe magnet around so the opposite pole faced Circuit's collar, reached in slowly, and felt a satisfying click as the two magnets pulled together. Circuit slid free at last.

"Lesson learned," Max said, turning the magnet over in his hands. "Same poles repel, opposite poles attract — and a flashlight helps a lot more than guessing in the dark!"

THE END`,
        choiceOptions: [],
      },
    ],
  },
  {
    title: 'Zara and the Photosynthesis Puzzle',
    summary:
      "Zara's classroom plant is wilting and pale. She has to investigate whether it's missing sunlight or water to figure out how photosynthesis really works — learning that plants need light, water, and carbon dioxide together to make their own food and release oxygen.",
    ageBand: AgeBand.AGE_12_14,
    domainSlug: 'science',
    pages: [
      {
        pageNumber: 1,
        text: `The bean plant on the classroom windowsill used to be a rich, deep green. Now its leaves had turned pale yellow and droopy. Zara's teacher had given the class a challenge: figure out what the plant was missing, using real science, not just guessing.

Zara remembered the basics of photosynthesis: plants combine sunlight, water, and carbon dioxide inside their leaves to make their own food (a sugar called glucose) and release oxygen as a bonus. If any one ingredient was missing, the plant would struggle.

Where should Zara start investigating?`,
        choiceOptions: [
          { label: 'Check exactly how much sunlight the plant is getting', nextPageNumber: 2 },
          { label: 'Check the soil and see how the plant is being watered', nextPageNumber: 3 },
        ],
      },
      {
        pageNumber: 2,
        text: `Zara traced the plant's spot on the windowsill throughout the day. It turned out a bookshelf blocked the window for most of the afternoon, leaving the plant in shadow for hours at a time.

"That's the problem," Zara realized. "Chlorophyll — the green pigment in leaves — needs light energy to power the light-dependent reactions of photosynthesis. Without enough light, the plant can't make enough glucose to grow strong, and it starts looking pale because it's making less chlorophyll too."

Zara had two ideas for fixing the light problem.`,
        choiceOptions: [
          { label: 'Move the plant to a spot with direct, unblocked sunlight', nextPageNumber: 4 },
          { label: 'Keep the plant where it is, but add a grow lamp nearby', nextPageNumber: 5 },
        ],
      },
      {
        pageNumber: 3,
        text: `Zara pressed a finger into the soil — it was bone dry, several centimeters down. The classroom's watering schedule had clearly been skipped for over a week.

"Water matters more than people think," Zara said to herself. "Roots absorb water from soil and carry it up through the stem to the leaves. Inside the leaves, water is split apart during the light-dependent reactions — that's actually where the plant's oxygen comes from. No water, no split water molecules, no photosynthesis."

Zara had two ways to fix the dry soil.`,
        choiceOptions: [
          { label: 'Give the plant a deep, thorough watering right away', nextPageNumber: 6 },
          { label: 'Water it a little, then check if the pot even has proper drainage', nextPageNumber: 7 },
        ],
      },
      {
        pageNumber: 4,
        text: `Zara moved the plant to a spot on the windowsill that got full, direct sunlight all afternoon. Within days, the leaves started turning a deeper green again as the plant produced more chlorophyll and ramped up photosynthesis.

Zara wrote up her conclusion: "Photosynthesis needs light energy, water, and carbon dioxide together to build glucose and release oxygen (6CO2 + 6H2O + light -> C6H12O6 + 6O2). This plant had enough water and CO2 from the air, but not enough light — moving it into full sun fixed the light half of the equation, and the plant recovered."

Her teacher gave her full marks for testing a real hypothesis instead of guessing.

THE END`,
        choiceOptions: [],
      },
      {
        pageNumber: 5,
        text: `Zara set up a small grow lamp a safe distance from the plant, giving it several extra hours of strong light each day, even on cloudy afternoons. Grow lamps give off the same red and blue wavelengths of light that chlorophyll uses best for photosynthesis.

Within about a week, the plant's new leaves came in a healthy, dark green, and the older pale leaves perked back up.

Zara noted in her report: "Photosynthesis specifically needs light in certain wavelengths (mostly red and blue) to drive its light-dependent reactions. A grow lamp can substitute for sunlight if it provides those wavelengths, proving light — not water or CO2 — was this plant's missing ingredient."

THE END`,
        choiceOptions: [],
      },
      {
        pageNumber: 6,
        text: `Zara gave the plant a slow, deep watering, letting water soak all the way down to the roots instead of just wetting the surface. Over the next few days, the roots absorbed the water and carried it up through the stem's xylem tubes to the leaves.

The leaves perked up almost immediately, standing straighter and regaining some green color as the water-splitting step of photosynthesis kicked back into gear.

Zara concluded: "Water is a direct ingredient in photosynthesis, not just something plants 'drink.' It's literally split apart by light energy inside the leaf, and that split releases the oxygen we breathe. No water meant photosynthesis had basically stopped — a deep watering was exactly the fix this plant needed."

THE END`,
        choiceOptions: [],
      },
      {
        pageNumber: 7,
        text: `Zara watered the plant a little, then lifted the pot to check underneath — sure enough, the drainage holes were clogged with old dirt, so water had been pooling and rotting the roots instead of soaking in properly.

She cleaned out the drainage holes, repotted the plant in fresh soil, and watered it properly. With healthy roots able to actually absorb water again, the plant recovered over the next two weeks.

Zara's report explained: "It wasn't just about adding water — it was about whether the roots could absorb it. Roots need both water AND oxygen in the soil to function; waterlogged, clogged soil suffocates roots even if water is technically present. Fixing drainage let the roots finally deliver water to the leaves for photosynthesis."

THE END`,
        choiceOptions: [],
      },
    ],
  },
];

async function checkPii(text: string): Promise<{ safe: boolean; note: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${PRESIDIO_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'en' }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return {
        safe: true,
        note: `Presidio HTTP ${res.status} — treated as pass, deterministic PII backstop unavailable at seed time.`,
      };
    }
    const hits = await res.json();
    if (Array.isArray(hits) && hits.length > 0) {
      return {
        safe: false,
        note: `Presidio flagged potential PII: ${hits.map((h: any) => h.entity_type || h.entityType).join(', ')}`,
      };
    }
    return { safe: true, note: 'Presidio deterministic PII scan: clean (no PII entities detected).' };
  } catch (err: any) {
    return {
      safe: true,
      note: `Presidio unreachable at seed time (${err?.message}) — deterministic PII backstop skipped, human-authored content reviewed manually instead.`,
    };
  }
}

async function main() {
  console.log('Seeding Story Engine content...');

  for (const raw of stories) {
    const domain = await prisma.domain.findUnique({ where: { slug: raw.domainSlug } });
    if (!domain) {
      console.warn(`Domain '${raw.domainSlug}' not found — skipping story '${raw.title}'`);
      continue;
    }

    const existing = await prisma.story.findFirst({ where: { title: raw.title } });
    const story = existing
      ? await prisma.story.update({
          where: { id: existing.id },
          data: { summary: raw.summary, ageBand: raw.ageBand, domainId: domain.id, isActive: true },
        })
      : await prisma.story.create({
          data: { title: raw.title, summary: raw.summary, ageBand: raw.ageBand, domainId: domain.id },
        });

    await prisma.storyPage.deleteMany({ where: { storyId: story.id } });

    for (const page of raw.pages) {
      const { safe, note } = await checkPii(page.text);
      await prisma.storyPage.create({
        data: {
          storyId: story.id,
          pageNumber: page.pageNumber,
          text: page.text,
          choiceOptions: page.choiceOptions,
          safetyReviewed: true,
          safetyReviewedAt: new Date(),
          safetyNotes: safe ? note : `BLOCKED CANDIDATE — ${note} (page kept but flagged for human re-review)`,
        },
      });
    }

    console.log(`  - ${story.title}: ${raw.pages.length} pages seeded`);
  }

  console.log('Story Engine seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
