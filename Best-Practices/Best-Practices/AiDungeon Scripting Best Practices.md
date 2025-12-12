A standardized scripting outline or format for beginner scripters and scripting in general to...

1\. Lessen the difficulty of combining different scripts from different creators  
2\. Improve formatting, consistency, and workflow  
3\. Improve understanding of coding  
4\. Reduce the size of “Input”, “Context”, and “Output” to one line of code.

\- Preinitialized variables, state variables, and functions

How to install:  
\- Plug each code in the respective library, input, context, output hooks.

Please feel free to leave suggestions or modify the format to share to everyone below\!

**// Library Script**

// Standardized Script Outline by Yi1i1i

// Order of script execution: Library\>Input\>Library\>Context\>Library\>Output  
// This function runs the Library Script.  
onLibrary();

// onLibrary: Insert all functions for "Library" here instead.  
function onLibrary() {  
  function1();

}

// onInput: Insert all functions for "Input" here instead.  
function onInput(text) {  
  text \= function2(text);

  return text;  
}

// onContext: Insert all functions for "Context" here instead.  
function onContext(text) {  
  text \= function3(text);

  return text;  
}  
// onOutput: Insert all functions for "Output" here instead.  
function onOutput(text) {  
  text \= function4(text);

  return text;  
}

// Initialize variables  
if(state.var1 \== undefined){  
  state.var1 \= false;  
  log("state.var1: " \+ state.var1);  
}

state.var2 \= state.var2 || 1;  
log("state.var2: " \+ state.var2);

// Function Declarations  
function function1() {  
  log("Running function1...");  
}

function function2(text) {  
  log("Running function2...");

  return text;  
}

function function3(text) {  
  log("Running function3 ...");

  return text;  
}

function function4(text) {  
  log("Running function4...");

  return text;  
}

**//Input Script**

// Every script needs a modifier function  
const modifier \= (text) \=\> {  
  text \= onInput(text);

  return { text }  
}

// Don't modify this part  
modifier(text)

**//Context Script**

// Every script needs a modifier function  
const modifier \= (text) \=\> {   
  text \= onContext(text);  
    
  return { text }  
}

// Don't modify this part  
modifier(text)

**//Output Script**

// Every script needs a modifier function  
const modifier \= (text) \=\> {  
  text \= onOutput(text);  
     
  return { text }  
}

// Don't modify this part  
modifier(text)

## **Scripting API**

## **Hooks**

The Scripting API consists of three lifecycle hooks.

### **`onInput`**

The **input** hook allows a script to modify the player’s input text before it is used to construct the model context.

### **`onModelContext`**

The **model** **context** hook allows a script to change the text sent to the AI model before the model is called.

### **`onOutput`**

The **output** hook allows a script to modify the model’s output text before it is returned to the player.

## **Params**

Scripting API hooks have access to the following information. When referencing one of these params in a script, you can reference the name of the parameter directly—you do not need to deconstruct it from an object.

### **`text`**

For the `onInput` hook, this field has the text entered by the player.

For the `onModelContext` hook, this field has the text that would otherwise be sent to the AI.

For the `onOutput` hook, this field has the text that would otherwise be sent back to the player.

### **`history`**

This field has an array of recent actions from the adventure.

Each action has the following fields.

* `text` \- the text of the action  
* `rawText` \- the same as text, deprecated and included for backwards compatibility.  
* `type` \- the type of the action, the most common types are listed below  
  * `start` \- the first action of an adventure  
  * `continue` \- an action created by the AI  
  * `do` \- a do action submitted by a player  
  * `say` \- a say action submitted by a player  
  * `story` \- a story action submitted by a player  
  * `see` \- a see action submitted by a player

### **`storyCards`**

This field has an array of story cards from the adventure.

Each story card has the following fields.

* `id` \- a unique numerical id for the story card  
* `keys` \- keys that should cause the story card to be included in the model context  
* `entry` \- the text that should be included in the model context if the story card is included  
* `type` \- a text field that can be used to separate story cards into categories

This field was formerly named `worldInfo`. References to `worldInfo` are still valid for backwards compatibility.

### **`state`**

This field is an object where scripts can store additional persistent information to be available across turns. Beyond being an object, this field can have any structure needed for the script.

To change the state, scripts can set values in the state object directly, without using a helper function.

In addition to creator-defined fields, the state object also expects to have the following fields.

`memory`

This field is an object with the current memory for the adventure, including the following fields.

* `context` \- is added to the beginning of the context, before the history. Corresponds to the Memory available in the UI.  
* `authorsNote` \- is added close to the end of the context, immediately before the most recent AI response. Corresponds to the Authors Note available in the UI.  
* `frontMemory` \- is added to the very end of the context, after the most recent player input.

Note that setting the `context` or `authorsNote` here will take precedence over the memory or authors note from the UI, but will not update them. If the `context` or `authorsNote` is not set or is set to an empty string, then the settings from the UI will still be used, so it is not possible to use the `state` to clear the memory or authors note completely.

Any updates made to the `memory` in the `onOutput` hook will not have any affect until the next player action.

`message`

This field is a string which will be shown to the user. (Not yet implemented on Phoenix).

### **`info`**

This field is an object that can contain additional values that may sometimes be useful. These values may be different for different hooks.

* All Hooks  
  * `characterNames` \- an array of character names for players of a multiplayer adventure  
  * `actionCount` \- the total number of actions in the adventure  
* `onModelContext`  
  * `maxChars` \- the estimated maximum number of characters that can be included in the model context (character per token can vary)  
  * `memoryLength` \- the number of characters included in the model context from the `memory`

## **Functions**

Scripting API hooks have access to the following functions.

### **`log`**

Logs information to the console.

Copy  
log("hello, world")

`console.log` also works to reduce confusion

`sandboxConsole.log` also works for backward compatibility, but is deprecated.

### **`addStoryCard`**

Adds a new story card and returns the index of the new card.

If there is already an existing card with the same keys, returns false.

Copy  
const newIndex \= addStoryCard(keys, entry, type)

`addWorldEntry` also works for backwards compatibility, but is deprecated.

### **`removeStoryCard`**

Removes a story card.

If the card doesn’t exist, throws an error

Copy  
removeStoryCard(index)

`removeWorldEntry` also works for backwards compatibility, but is deprecated.

### **`updateStoryCard`**

Updates a story card.

If the card doesn’t exist, throws an error

Copy  
updateStoryCard(index, keys, entry, type)

`updateWorldEntry` also works for backwards compatibility, but is deprecated.

## **Return**

Scripting API hooks can return the following values

### **`text`**

For the `onInput` hook, this will replace the text entered by the player.

Returning an empty string in `onInput` throws an error which is shown to the player and says **`Unable to run scenario scripts`.**

For the `onModelContext` hook, this will replace the text sent to the AI.

Returning an empty string in `onModelContext` causes the context to be built as though the script did not run.

For the `onOutput` hook, this will replace the text returned to the player.

Returning an empty string in `onOutput` throws an error which is shown to the player and says **`A custom script running on this scenario failed. Please try again or fix the script.`**

Copy  
return { text: 'New text' }

Returning the text `stop` is equivalent to returning `stop: true`.

### **`stop`**

If `stop === true`, then the game loop will not proceed. This is useful in cases where you want a player input to update the state but to not run the AI.

When you return `stop` in the `onInput` hook, it throws an error which is shown to the player and says **`Unable to run scenario scripts`**

When you return `stop` in the `onModelContext` hook, it throws an error which is shown to the player and says **`Sorry, the AI is stumped. Edit/retry your previous action, or write something to help it along.`**

When you return `stop` in the `onOutput` hook, it changes the output to `stop`. Don’t do this.

Copy  
return { stop: true }

## **Example Scripts**

If you have additional example scripts that you’d like to submit for this section, please send them to support@aidungeon.com. The examples below are from the Scripting repo.

### **Basic Example**

Copy  
const modifier \= (text) \=\> {  
    
  let modifiedText \= text  
      
  // The text passed in is either the user's input or players output to modify.  
  if(text.includes('grab a sword')) {      
        
    // You can modify the state variable to keep track of state throughout the adventure  
    state.items \= \['sword'\]  
      
    // Setting state.memory.context will cause that to be used instead of the user set memory  
    state.memory \= {context: 'You have a sword.'}  
      
    // Setting state.message will set an info message that will be displayed in the game   
    state.message \= 'You got a sword\!'  
      
    // You can log things to the side console when testing with console.log  
    console.log('Added a sword to player')  
      
    modifiedText \= text \+ '\\nYou also now have a sword\!'  
  }  
    
    // You must return an object with the text property defined.   
    return {text: modifiedText}  
}

// Don't modify this part  
modifier(text)

### **Don’t Be Negative**

Copy  
const modifier \= (text) \=\> {  
  // This will always result in a shorter string, so no need to truncate it.  
  return { text: text.replace(/ not /gi, ' ') }  
}

// Don't modify this part  
modifier(text)

### **Notes**

Copy  
// Input Modifier

const modifier \= (text) \=\> {  
  state.notes \= state.notes || \[\]

  if (text.match(/\> You note:/i)) {  
    const note \= text.replace(/\> You note: ?/i, '').trim()  
    state.notes.push({  
      pattern: history.map(({text}) \=\> text).join('').split("\\n").pop(),  
      note,  
      actionCount: info.actionCount,  
    })  
    state.message \= \`Noted: ${note}\`  
    text \= ''  
  } else {  
    delete state.message  
  }

  return {text}  
}

// Don't modify this part  
modifier(text)

// Set a note by typing \`note: \` when in Do mode. It will be tagged to whatever the most recent line of text is, appearing below it to the AI, but not visible to the user.

// Context Modifier

// info.memoryLength is the length of the memory section of text. text.slice(0, info.memoryLength) will be the memory.  
// info.maxChars is the maximum length that text can be. The server will truncate text to this length.   
// info.actionCount is the number of actions in this adventure.

const modifier \= (text) \=\> {  
  state.notes \= state.notes || \[\]

  const contextMemory \= info.memoryLength ? text.slice(0, info.memoryLength) : ''  
  let context \= info.memoryLength ? text.slice(info.memoryLength) : text

  // Assumes that the notes are sorted from oldest to newest.  
  state.notes \= state.notes.filter(({ pattern, note, actionCount }) \=\> {  
    if (actionCount \> info.actionCount) {  
      // The user must have hit undo, removing this note.  
      return false  
    }

    const index \= context.indexOf(pattern)  
      
    if (index \>- 1\) {  
      context \= \[context.slice(0, index \+ pattern.length), "\\n", note, context.slice(index \+ pattern.length)\].join('')  
      return true  
    } else {  
      // Only keep ones that were found, otherwise they must have moved out of the history window.  
      return false  
    }  
  })

  // Make sure the new context isn't too long, or it will get truncated by the server.  
  context \= context.slice(-(info.maxChars \- info.memoryLength))  
  const finalText \= \[contextMemory, context\].join("\\n")  
  return { text: finalText }  
}

// Don't modify this part  
modifier(text)

### **Reimplement Authors Note**

Copy  
// info.memoryLength is the length of the memory section of text.  
// info.maxChars is the maximum length that text can be. The server will truncate the text you return to this length.

// This modifier re-implements Author's Note as an example.  
const modifier \= (text) \=\> {  
  const contextMemory \= info.memoryLength ? text.slice(0, info.memoryLength) : ''  
  const context \= info.memoryLength ? text.slice(info.memoryLength) : text  
  const lines \= context.split("\\n")  
  if (lines.length \> 2\) {  
    const authorsNote \= "Everyone in this story is an AI programmer."  
    lines.splice(-3, 0, \`\[Author's note: ${authorsNote}\]\`)  
  }  
  // Make sure the new context isn't too long, or it will get truncated by the server.  
  const combinedLines \= lines.join("\\n").slice(-(info.maxChars \- info.memoryLength))  
  const finalText \= \[contextMemory, combinedLines\].join("")  
  return { text: finalText }  
}

// Don't modify this part  
modifier(text)

### **Command Parser**

Copy  
// This is an example Input Modifier that looks for commands from the user.

const modifier \= (text) \=\> {  
  let stop \= false

  // This matches when the user types in ":something arg1 arg2" in any of the three input formats. For example, they could  
  // type ":status" and then command would be "status" and args would be \[\], or they could type ":walk north" and command  
  // would be "walk" and args would be \["north"\].  
  const commandMatcher \= text.match(/\\n? ?(?:\> You |\> You say "|):(\\w+?)( \[\\w \]+)?\[".\]?\\n?$/i)  
  if (commandMatcher) {  
    const command \= commandMatcher\[1\]  
    const args \= commandMatcher\[2\] ? commandMatcher\[2\].trim().split(' ') : \[\]  
    state.message \= \`Got command '${command}' with args ${JSON.stringify(args)}\`  
    stop \= true  
    text \= null  
  } else {  
    delete state.message  
  }

  // You must return an object with the text property defined.  
  // If you include { stop: true } when inside of an input modifier, processing will be stopped and nothing will be  
  // sent to the AI.  
  return { text, stop }  
}

// Don't modify this part  
modifier(text)

### **Death Island**

Copy  
const modifier \= (text) \=\> {  
  let modifiedText \= text  
    
  if(\!state.events){  
    state.turn \= 0  
    state.events \= \[  
    'You hear a rustling in the bushes near you. Suddenly',  
    'An ear splitting scream suddenly echoes',  
    'You feel a cold chill go up your spine. You look up and see',  
    'You suddenly get hit by',  
    'Before you can do that you hear a loud crash. You look towards the sound and see a dark demonic looking creature',  
    'You discover a horrifying',  
    'You hear a terrifying sound',  
    'You wake up and realize you were dreaming. You look down and see that your arms are in shackles',  
    'A hand grabs your leg and you trip hitting your head on a stone. You wake up in a cage',  
    'An uneasy feeling begins to settle in your stomach as',  
    'You remember a dark feeling from last night',  
    'Suddenly a bloody head rolls toward you from out of the bushes',  
    'You see a massive creature',  
    'A band of cannibals',  
    'You see a band of cannibals',  
    'A dark creature',  
    'You feel a sharp pain in your side and realize'  
    \]  
  }  
  else{  
    modifiedText \= "\\n\> You try to " \+ text.substring(7)  
  }  
    
  state.turn \= state.turn \+ 1  
    
  if(state.turn \> 2){  
  state.memory \= {context:  "You're probably going to die."}  
  }  
  if(state.turn \> 6){  
    state.memory \= {context: "You're about to die."}  
  }  
  else if(state.turn \> 10){  
    state.memory \= {context: "You have no hope. There are minutes left till you die."}  
  }

  const nTurn \= Math.floor((Math.random() \* 2)) \+ 3

  if(state.turn % nTurn \=== 0){  
    const eventInd \= Math.floor((Math.random() \* state.events.length));  
      if(eventInd \< state.events.length){  
        modifiedText \= modifiedText \+ '\\n' \+ state.events\[eventInd\]  
        state.events.splice(eventInd)  
      }  
  }  
    
      
    // You must return an object with the text property defined.   
  return {text: modifiedText}  
}

// Don't modify this part  
modifier(text)

### **Guess or Die**

Copy  
// Input Modifier  
const modifier \= (text) \=\> {  
  if(\!state.initialized) {  
    state.initialized \= true;  
    state.randomNumber \= Math.round(Math.random()\*9999+1);  
    state.remainingGuesses \= 13;  
  }  
      
  var match \= text.match(/(\\d+)/)  
  if(match && match\[1\]) {  
    state.remainingGuesses--;  
    var number \= parseInt(match\[1\]);

    var output \= "\\nYou have "+state.remainingGuesses+" guesses remaining.  ";

    if(number \== state.randomNumber) {  
      output \+= "\\nYou guessed the number\!  Congratulations, you win\!";  
    } else if (state.remainingGuesses \<= 0\) {  
      output \+= "\\nYou ran out of guesses\!  You are dead.  You lose\!";  
    } else if (number \> state.randomNumber) {  
      output \+= "\\nYour guess is too high\!";  
    } else if (number \< state.randomNumber) {  
      output \+= "\\nYour guess is too low\!";  
    }  
    state.nextOutput \= output;  
    return {text}  
  }  
  state.nextOutput \= "\\nPlease enter a number\!";  
  return {text};  
}

modifier(text)

// Output Modifer  
const modifier \= (text) \=\> {  
  return {text: state.nextOutput ? state.nextOutput : ""};  
}

modifier(text)

### **Magic**

Copy  
// Here's a fun scripting example where players have to learn these magic spells to have cool effects.  
// The world info has entries that should hopefully lead people to these spells and so that they can find and cast them.  
// Can find the scenario at https://play.aidungeon.com/scenario/ANK4YlUw3xYx/legends-of-magic  
// I changed the spell names so it doesn't ruin the discovery if you play the adventure.

const modifier \= (text) \=\> {  
    
  let modifiedText \= text  
  state.message \= ''  
    
  if(\!state.spells){  
    state.spells \= \[\]  
  }  
    
  const spells \= {  
    'SPELL1': 'a deathly fire ball spell that',  
    'SPELL2': 'turning yourself into a cloud allowing you to move at will',  
    'SPELL3': 'a dark spell that summons an evil demon. You hear a dark rumbling and see a cloud of black smoke appear. Out of it appears a large horned demon'  
  }  
    
  const lowered \= text.toLowerCase()  
	for(spellName in spells){  
    if(lowered.includes('cast ' \+ spellName.toLowerCase())){  
      if(\!state.spells.includes(spellName)){  
        state.spells.push(spellName)  
        state.message \= "Congrats you've learned the " \+ spellName \+ " spell\!"  
      }  
      modifiedText \= text \+ '\\n' \+ 'You cast ' \+ spellName \+ ', ' \+ spells\[spellName\]  
    }  
  }  
      
    return {text: modifiedText}  
}

modifier(text)

### **Sundale**

Copy  
// An example of how scripting can be used to manipulate quests, as well as how messages and the state variable can be used to store and show information  
// The code can be given basic changes using the state.configuration object, without needing to deal with the rest of the code  
// The scenario this was made for can be seen at https://play.aidungeon.com/scenario/80sASRH07Lwk/sundale

// INPUT MODIFIER

const modifier \= (text) \=\> {  
    state.configuration \= {  
        enableSelectionOnCompletedQuest: false, // Whether quest selection should be restricted until a specific quest is completed  
        enableSelectionOnQuest: 0, // The line number of the quest in the list of quests (e.g. quest on second line \= 2\) on the Edit Scenario page. Only used when the above is true.  
        initialQuests: 0, // The amount of quests inputted into the Edit Scenario page  
        quests: \[ // The quests that will become available to the player either after the above quest is completed or at the start of the scenario.  
            {  
                name: "quit your job", // The quest's name, shown in the selection message  
                objectives: \["resign from your job"\], // The objectives that are part of the quest  
                nextQuests: \[ // The quests that should be assigned after the player completes this one  
                    {  
                        name: "find a new job",  
                        objectives: \["get a job"\],  
                        nextQuests: \[\]  
                    }  
                \]  
            }  
        \]  
    }

    if (state.initialised \!= true) {  
        state.finishedScenario \= false  
        state.initialised \= true  
        if (\!state.configuration.enableSelectionOnCompletedQuest) {  
            state.availableQuests \= JSON.parse(JSON.stringify(state.configuration.quests))  
        } else {  
            state.availableQuests \= \[\]  
        }  
        state.assignedQuest \= ""  
        state.nextOutput \= ""  
    }

    state.nextOutput \= ""

    if (text.toLowerCase().startsWith("\\n\> you take up quest ")) {  
        state.assignedQuest \= JSON.parse(JSON.stringify(state.availableQuests\[text.toLowerCase().substring(21) \- 1\]))  
        quests.push({  
            quest: state.assignedQuest.objectives.shift()  
        })  
        state.nextOutput \= "You decide that the next thing you want to do with your life is " \+ state.assignedQuest.name.toLowerCase() \+ "."  
    } else if (text.toLowerCase().includes("\\n\> you give up on your quest.")) {  
        state.nextOutput \= "You give up on your quest to " \+ state.assignedQuest.name.toLowerCase() \+ "."  
        state.assignedQuest \= ""  
        quests.splice(state.configuration.initialQuests)  
    }

    return {  
        text: text  
    }  
}

modifier(text)

// OUTPUT MODIFIER

const modifier \= (text) \=\> {

    let modifiedText \= text

    if (\!state.finishedScenario || \!state.configuration.enableSelectionOnCompletedQuest) state.message \= ""

    if ((state.finishedScenario || \!state.configuration.enableSelectionOnCompletedQuest) && state.assignedQuest \== "") {  
        questNames \= \[\]  
        for (quest of state.availableQuests) {  
            questNames.push(quest.name)  
        }  
        state.message \= "Available Quests: " \+ questNames.join(", ") \+ ". To take up a quest, type 'take up quest \<quest number in list\>'."  
    } else if (state.assignedQuest \!= "") {  
        if (\!quests\[state.configuration.initialQuests\].completed) {  
            state.message \= "Current Objective: " \+ quests\[state.configuration.initialQuests\].quest \+ ". To quit, type 'give up on my quest'."  
        } else {  
            nextObjective \= state.assignedQuest.objectives.shift()  
            if (nextObjective \== undefined) {  
                quests.splice(state.configuration.initialQuests)  
                state.availableQuests \= state.availableQuests.filter(e \=\> e.name \!== state.assignedQuest.name)  
                for (nextQuest of state.assignedQuest.nextQuests) {  
                    state.availableQuests.push(nextQuest)  
                }  
                state.assignedQuest \= ""  
                questNames \= \[\]  
                for (quest of state.availableQuests) {  
                    questNames.push(quest.name)  
                }  
                state.message \= "Available Quests: " \+ questNames.join(", ") \+ ". To take up a quest, type 'take up quest \<quest number in list\>'."  
            } else {  
                quests.splice(state.configuration.initialQuests)  
                quests.push({  
                    quest: nextObjective  
                })  
                state.message \= "Objective completed\! New objective: " \+ quests\[state.configuration.initialQuests\].quest \+ ". To quit, type 'give up on my quest'."  
            }  
        }  
    }

    if (state.configuration.enableSelectionOnCompletedQuest) {  
        if (quests\[state.configuration.enableSelectionOnQuest \- 1\].completed \== true && \!state.finishedScenario) {  
            state.message \= "Quests have been assigned and will be accessible next turn."  
            state.finishedScenario \= true  
            state.availableQuests \= JSON.parse(JSON.stringify(state.configuration.quests))  
        }  
    }

    if (state.nextOutput \!== "") {  
        return {  
            text: state.nextOutput  
        }  
    }

    return {  
        text: modifiedText  
    };  
}

modifier(text)

## **Known Issues**

## **Story Cards**

* Changes to story cards made in earlier hooks are not always present in later hooks.  
* Update to story cards in the context hook are overwritten if separate updates are made in the output hook.

