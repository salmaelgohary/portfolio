/* Wording corrections applied on top of the design canvas.

   The canvas copy drifted from the case-study markdown in `case-studies/` —
   sentences were condensed, clauses were joined with em dashes, and a few
   phrases were rewritten. The markdown is the source of truth, so each entry
   below restores it.

   Every `from` must match exactly once in its page or the build fails, so a
   re-export that changes the wording is caught rather than silently ignored.

   Apostrophes are matched loosely (' or ’) because the canvas and the markdown
   are inconsistent about which they use. */

module.exports = {

  'trax.html': [
    ['Five key problems',
     'I found five key problems:'],

    ['No clear way to start a new question without losing context.',
     'There was no clear way to start a new question without losing the current context.'],

    ['>Users were asking for<',
     '>Users were asking for...<'],

    ['300+ municipalities',
     '400+ industry firms'],

    ['This made capabilities immediately visible',
     'This made Copilot’s capabilities immediately visible'],

    ['but was less scalable',
     'but it was less scalable'],

    ['This made types easier to distinguish',
     'This made filter types easier to distinguish'],

    ['could be read as carrying meaning',
     'could be interpreted as having different meanings'],

    ['We redesigned the citations as a reference panel so users could verify',
     'We chose the reference panel so users could verify'],

    ['reducing clicks and matching the Pro experience. Faster, but could make Standard users expect conversations to carry context and be saved.',
     'reducing the number of clicks and matching the Pro experience. This was faster, but could make Standard users expect their conversations to carry context and be saved like Pro chats.'],

    ['compliance questions, focusing on whether',
     'compliance questions. I’d focus on whether'],
  ],

  'wondermakr.html': [
    ['repeated clarification requests between',
     'repeated clarification requests and questions between'],

    ['>A reusable onboarding experience that makes xVend easier to understand.',
     '>We created a reusable onboarding experience that makes xVend easier to understand.'],

    ['The research pointed to three core needs.',
     'The research pointed to three core needs:'],
  ],

  'amd.html': [
    ['>1M+ users<', '>10M+ users<'],

    /* Design decisions: how to navigate the Playbooks catalog */
    ['The first version listed Playbooks directly in the navigation, but this became harder to browse as the catalog grew.',
     "The first version simply listed all Playbooks in the side panel. This approach worked since this release only shipped 7 Playbooks. However, it is not scalable as more Playbooks get added over time."],
    ['We added search and filters based on the existing Playbooks experience so users could browse the growing catalog without scrolling through a long list.',
     'For scalability, I explored adding search and filters that match the existing Playbooks experience so users could browse the growing catalog without scrolling through a long list.'],
    ['<strong style="font-weight:600">We chose search and filters</strong> to make a growing Playbooks catalog easier to navigate.',
     '<strong style="font-weight:600">We kept search and filters as a future feature.</strong> It\'s the stronger experience, but this release didn\'t have enough Playbooks to justify it just yet. I also considered smarter filtering beyond a basic search bar, which would be a bigger investment, so we prioritized it for a later release.'],

    /* both labels are bold, so a closing tag sits after the colon */
    ['</strong> discover AI tools, understand what they do, identify the right software, install software.',
     '</strong> Discover AI tools, understand what they do, identify the right software, install software'],

    ['</strong> install software, manage installation locations, maintain compatible versions.',
     '</strong> Install software, manage installation locations, maintain compatible versions'],

    ['Insight: beginners needed', 'Insight: Beginners needed'],
    ['Insight: different users need', 'Insight: Different users need'],

    ['fixed locations — so how might we expose that flexibility without making installation feel complicated?',
     'fixed locations. How might we expose that flexibility without making installation feel complicated?'],

    ['so we added a tag to surface those without requiring users to expand the install paths',
     'so we added a tag to surface those locked locations without requiring users to expand out the install paths'],

    ['to keep path, version, and size from competing for space',
     'to keep the path, version, and size information from competing for space'],

    ['Some applications require other components to work — PyTorch requires Python, for example.',
     'Some applications require other components to work. For example, PyTorch requires Python.'],

    /* image captions with a direct counterpart in the markdown */
    ['Exploration 1 — global drive selector', 'Exploration 1: Global drive selector'],
    ['Exploration 2 — show every install path', 'Exploration 2: Show every install path'],
    ['Exploration 3 — hide paths by default', 'Exploration 3: Hide paths by default'],
    ['Exploration 4 — surface locked locations', 'Exploration 4: Surface locked locations'],
  ],

  'sleepwell.html': [
    ['The temperature target is the home screen — one clear value to adjust.',
     'The temperature target is the home screen: one clear value to adjust.'],

    ['>An automated system that monitors and regulates room temperature overnight',
     '>SleepWell: An automated system that monitors and regulates room temperature overnight'],

    ['completely manual — get out of bed, change the controls, and try to fall back asleep.',
     'completely manual. They have to get out of bed, change the controls, and try to fall back asleep.'],

    ['SleepWell responds to changes in body temperature as they happen and adjusts the environment before discomfort wakes someone up.',
     'Instead of telling people their sleep was disrupted after the fact, SleepWell can respond to changes in body temperature as they happen and adjust the environment before discomfort wakes them up.'],

    ['>Connecting the wearable, climate control, and app creates one system',
     '>Most sleep products stop at tracking or reporting. Connecting the wearable, climate control, and app creates one system'],

    ['Over time, body temperature and sleep data reveal patterns unique to each person, moving beyond a fixed temperature setting.',
     'Over time, body temperature and sleep data can reveal patterns unique to each person. This gives SleepWell an opportunity to move beyond a fixed temperature setting toward a more personalized sleep environment.'],

    ['beyond a single night — seeing how body temperature connects to sleep quality helps people understand what works for them.',
     'beyond a single night. Seeing how body temperature connects to sleep quality could help people understand what works for them instead of simply reacting when the room gets too hot or cold.'],

    ['showing a need for shorter, scannable content.',
     'showing a need for shorter, more scannable content.'],

    ['because there were no visual cues.',
     'because there were no visual cues to show that elements were interactive.'],

    ['which reinforced that iteration is part of building something that actually works for people.',
     'which reinforced that iteration isn’t extra work. It’s part of building something that actually works for people.'],

    ['Next, I would include university students and parents to understand how sleep needs and temperature preferences change across life stages.',
     'Next, I would expand the research to include university students and parents to understand how sleep needs and temperature preferences change across different life stages.'],

    ['broader accessibility considerations, giving people more control over their visual experience.',
     'broader accessibility considerations. Giving people more control over their visual experience could make SleepWell more comfortable and inclusive.'],

    /* outcome cards: the canvas split the markdown's headline in two and
       compressed the evidence behind an em dash */
    ['>60% increase<', '>Increased successful sleep logging by 60%<'],
    ['>in successful sleep logging — 3 of 5 users first clicked the wrong control; after refining, all 5 found it<',
     '>Before testing, 3 of 5 users clicked the wrong control when asked to log their sleep. After refining the design based on testing insights, all 5 users identified and clicked the correct button.<'],

    ['>100% increase<', '>Increased discovery of sleep insights by 100%<'],
    ['>in insight discovery — no user expanded an insight before testing; all 5 did after<',
     '>Before testing, none of the users realized that the sleep insights could be expanded. After refining the interaction, all 5 users successfully expanded the tab.<'],
  ],

  'go-smart.html': [
    ['needs to leave — traffic, weather, walking time, or a personal schedule.',
     'needs to leave, like traffic, weather, walking time, or their personal schedule.'],

    ['For students, when to leave depends on their classes, routines, and what is happening around them.',
     'For students, when to leave depends on more than the bus schedule. It depends on their classes, routines, and what is happening around them.'],

    ['>GO Smart combines real-world conditions',
     '>GO Smart is an AI-powered commuting assistant that combines real-world conditions'],

    ['Initial discussions with university students uncovered four key pain points.',
     'Initial discussions with university students helped us uncover 4 key pain points:'],

    ['>Transit updates were delayed or inaccurate',
     '>Transit updates were sometimes delayed or inaccurate'],

    ['to know something had changed.',
     'to know that something had changed.'],

    ['but these factors were never considered together.',
     'but these factors were not considered together.'],

    ['This pushed us to focus on what the passenger could actually control: knowing when to leave.',
     'This pushed us to focus on what the passenger could actually control: knowing when to leave. That became the foundation for the final product direction.'],

    /* the label is bold, so a closing tag sits between the two words */
    ['>Key insight:</strong> the information',
     '>Key Insight:</strong> The information'],
  ],

  'u4ria.html': [
    ['treat AI like a production line — writing clear instructions',
     'treat AI like a production line by writing clear instructions'],

    ['>I converted creative direction into structured prompts',
     '>Second, I converted creative direction into structured prompts'],

    ['>I produced multiple variations per prompt',
     '>Third, I produced multiple variations per prompt'],

    ['>I brought generated assets into Canva',
     '>Fourth, I brought generated assets into Canva'],

    ['>I built an organized tracking system in Airtable',
     '>Finally, I built an organized tracking system in Airtable'],

    ['and brand frames — keeping the text easy to read and matching U4RIA\'s visual style.',
     'and brand frames. The focus was on keeping the text easy to read and making sure it matched U4RIA’s visual style.'],

    ['I generated realistic food photos for grain bowls, smoothies, and light dinners, and built reusable prompt templates in Airtable so the team could make new recipe photos later without breaking the style.',
     'I generated realistic food photos for different categories like grain bowls, smoothies, and light dinners. Here, I built reusable prompt templates in Airtable so the rest of the team could easily make new recipe photos later without messing up the style.'],

    ['I designed the starting and ending screens by hand in Canva for full control over layout, then used Kling AI to generate only the transition between them.',
     'I designed the starting and ending screens by hand in Canva, giving me control over the layout. I then used Kling AI to make the transitions between them.'],

    ['I made guided affirmations and background music in Suno, testing voice tone, speed, and background sounds to match different kinds of mindfulness exercises.',
     'I made guided affirmations and background music tracks using Suno. Here, I constantly tested and tweaked the voice tone, speed, and background sounds to match different kinds of mindfulness exercises.'],

    ['I generated scene images in Midjourney, turned them into clips with Kling AI, and stitched them into loops in Canva for TikTok and Reels.',
     'I put together looping videos for TikTok and Reels by generating scene images in Midjourney, turning them into video clips with Kling AI, and stitching them together in Canva.'],

    ['AI works best when prompts are clear boundaries instead of vague suggestions. Defining the mood, inputs, and rules up front produced fewer stray variants and moved everything faster.',
     'AI works best when your prompts are clear boundaries instead of vague suggestions. When you clearly define the mood, inputs, and rules right at the start, you get fewer variant results and everything moves a lot faster.'],

    ['Treating it as a production tool rather than a source of direction resulted in higher-quality, more intentional outputs.',
     'Treating AI as a production tool, not a source of direction, resulted in higher-quality, more intentional outputs and maintained creative control throughout.'],

    ['>38% reduction<', '>Reduced revision work by 38%<'],
    ['>in revision work — setting goals early and reusing tracked prompts meant far less back and forth<',
     '>Setting goals early and reusing tracked prompts meant way less going back and forth trying to get things right.<'],
  ],
};
