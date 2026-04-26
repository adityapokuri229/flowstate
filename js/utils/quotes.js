/* ============================================================
   FlowState — Quotes Library
   Categorized quotes for flow, engineering, medicine, startup, etc.
   ============================================================ */

const FlowQuotes = {
  quotes: {
    engineering: [
      { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
      { text: "An equation for me has no meaning unless it expresses a thought of God.", author: "Srinivasa Ramanujan" },
      { text: "Excellence is a continuous process and not an accident.", author: "A.P.J. Abdul Kalam" },
      { text: "No one remembers the easy ones.", author: "Unknown Engineer" },
      { text: "To understand the universe, you must understand the language in which it is written, the language of mathematics.", author: "Galileo Galilei" }
    ],
    medicine: [
      { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler" },
      { text: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
      { text: "He who studies medicine without books sails an uncharted sea, but he who studies medicine without patients does not go to sea at all.", author: "William Osler" },
      { text: "Cure sometimes, treat often, comfort always.", author: "Hippocrates" },
      { text: "Medicine is a science of uncertainty and an art of probability.", author: "William Osler" }
    ],
    startup: [
      { text: "I'm convinced that about half of what separates the successful entrepreneurs from the non-successful ones is pure perseverance.", author: "Steve Jobs" },
      { text: "Work like there is someone working 24 hours a day to take it all away from you.", author: "Mark Cuban" },
      { text: "If you're not embarrassed by the first version of your product, you've launched too late.", author: "Reid Hoffman" },
      { text: "Performance leads to recognition. Recognition brings respect. Respect enhances power. Power clears the path to the goal.", author: "N. R. Narayana Murthy" },
      { text: "A startup is a company designed to grow fast. Being newly founded does not in itself make a company a startup.", author: "Paul Graham" }
    ],
    civil: [
      { text: "The price of greatness is responsibility.", author: "Winston Churchill" },
      { text: "He who is not courageous enough to take risks will accomplish nothing in life.", author: "Muhammad Ali" },
      { text: "In matters of style, swim with the current; in matters of principle, stand like a rock.", author: "Thomas Jefferson" },
      { text: "Public service must be more than doing a job efficiently and honestly. It must be a complete dedication to the people and to the nation.", author: "Margaret Chase Smith" },
      { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" }
    ],
    law: [
      { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
      { text: "The life of the law has not been logic; it has been experience.", author: "Oliver Wendell Holmes Jr." },
      { text: "The leading rule for the lawyer, as for the man of every other calling, is diligence.", author: "Abraham Lincoln" },
      { text: "Laws are like cobwebs, which may catch small flies, but let wasps and hornets break through.", author: "Jonathan Swift" },
      { text: "It is the spirit and not the form of law that keeps justice alive.", author: "Earl Warren" }
    ],
    universal: [
      { text: "The best moments usually occur when a person's body or mind is stretched to its limits in a voluntary effort to accomplish something difficult and worthwhile.", author: "Mihaly Csikszentmihalyi" },
      { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
      { text: "Fall in love with some activity, and do it! Nobody ever figures out what life is all about, and it doesn't matter.", author: "Richard Feynman" },
      { text: "What you choose to focus on becomes your reality.", author: "William James" },
      { text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
      { text: "Flow is being completely involved in an activity for its own sake.", author: "Mihaly Csikszentmihalyi" }
    ]
  },

  categorizeDream(dream) {
    if (!dream) return 'universal';
    const d = dream.toLowerCase();
    
    if (d.includes('iit') || d.includes('jee') || d.includes('engineering') || d.includes('tech')) return 'engineering';
    if (d.includes('neet') || d.includes('mbbs') || d.includes('medicine') || d.includes('doctor') || d.includes('medical') || d.includes('aiims')) return 'medicine';
    if (d.includes('startup') || d.includes('founder') || d.includes('build') || d.includes('company') || d.includes('business')) return 'startup';
    if (d.includes('upsc') || d.includes('ias') || d.includes('civil') || d.includes('ips')) return 'civil';
    if (d.includes('law') || d.includes('lawyer') || d.includes('clat') || d.includes('judge')) return 'law';
    
    return 'universal';
  },

  getQuote(dream) {
    const category = this.categorizeDream(dream);
    const categoryQuotes = this.quotes[category] || this.quotes['universal'];
    
    const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
    return categoryQuotes[randomIndex];
  },

  getRandomQuote() {
    return this.getQuote('');
  }
};

window.FlowQuotes = FlowQuotes;
