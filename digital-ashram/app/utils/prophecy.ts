export const getDivineProphecy = (hairCount: number) => {
  if (hairCount > 150000) {
    return {
      malayalam: "ദൈവമേ! ഇത് തലയല്ല, ആമസോൺ കാടാണ്! 🌳",
      english: "(My God! That's not a head, it's the Amazon rainforest!)"
    };
  }
  if (hairCount > 100000) {
    return {
      malayalam: "കൊള്ളാം! തലയിൽ ആവശ്യത്തിന് എണ്ണയുണ്ട്. 🛢️",
      english: "(Impressive! There's enough oil in the well.)"
    };
  }
  if (hairCount > 50000) {
    return {
      malayalam: "നിങ്ങളുടെ തലയിൽ ഒരു ഗാലക്സി ഉണ്ട്! 🌌",
      english: "(There's a galaxy in your head!)"
    };
  }
  if (hairCount > 10000) {
    return {
      malayalam: "എല്ലാം പോയിട്ടില്ല... ഇനിയും പ്രതീക്ഷക്ക് വകയുണ്ട്. ✨",
      english: "(Not all is lost... There is still room for hope.)"
    };
  }
  if (hairCount > 1000) {
    return {
      malayalam: "ചിലപ്പോൾ കുറവ് ആണ് ഭാഗ്യം! 🍀",
      english: "(Sometimes less is more!)"
    };
  }
  if (hairCount > 100) {
    return {
      malayalam: "ബാൾഡ് ആണ് ഫാഷൻ! ക്ലീൻ ലുക്ക്! 🎭",
      english: "(Bald is beautiful! Clean look!)"
    };
  }
  return {
    malayalam: "വിഷമിക്കേണ്ട, ജ്ഞാനികൾക്ക് പലപ്പോഴും മുടി കുറവായിരിക്കും! 🧙‍♂️",
    english: "(Don't worry, wise men are often short on hair!)"
  };
};

export const getAnalysisComment = (analysisTime: string, confidence: number) => {
  const time = parseFloat(analysisTime.replace('s', ''));
  
  if (time < 2) {
    return {
      malayalam: "വേഗതയുള്ള ഗുരു! ⚡",
      english: "(Fast guru!)"
    };
  }
  if (time < 5) {
    return {
      malayalam: "സാധാരണ വേഗതയിൽ ഗുരു! 🧘‍♂️",
      english: "(Normal speed guru!)"
    };
  }
  return {
    malayalam: "ഗുരു ചിന്തിക്കുന്നു... 🤔",
    english: "(Guru is thinking...)"
  };
};

export const getConfidenceComment = (confidence: number) => {
  if (confidence > 0.8) {
    return {
      malayalam: "ഉറപ്പായും ശരിയാണ്! ✅",
      english: "(Definitely correct!)"
    };
  }
  if (confidence > 0.6) {
    return {
      malayalam: "ഒരു പക്ഷേ ശരിയാവാം! 🤷‍♂️",
      english: "(Maybe correct!)"
    };
  }
  return {
    malayalam: "ഗുരു ഊഹിക്കുന്നു! 🔮",
    english: "(Guru is guessing!)"
  };
};
