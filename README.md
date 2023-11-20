# Tetris-AI-Trainer
An implementation for training my Artificial Intelligence Tetris bot

## Contents
This repository has scripts that are able designed to train the weights for a Tetris bot that I created that runs in the browser.
There are two versions of the script.
One is written in NodeJS (a program to execute JavaScript outside the browser) and the other is written in C++ and is
**significantly** faster than the one written in JavaScript.
It also contains a simple web page that can demonstrate the results of training.

Check inside each folder for a more comprehensive overview of each component.

## Backstory for this project
Here's some context for why I built these things in the first place. This is a bit of a ramble.
In October of 2023, I decided I wanted to build a game of Tetris.
So, I pulled an all nighter and finished the game in about 3 hours.
Why was it an all nighter? Because the rest of the night was spent styling the game and going back and forth with my roommate, who was an
avid Tetris player in his teens, to try to get the look and feel of the game right. In the end, I reached a point where I was
satisfied with the end product.

It was only after programming Tetris that I realized I was bad at it. I couldn't compare to my dad, my roommate, or even my mother (who
is notoriously bad at video games I'll have you know).
So I decided I should create an AI to do it. To allow me to compete with my self-proclaimed rivals.

## How this was accomplished
I am most familiar with JavaScript, so I decided (at first) that I would write the training algorithm in JS and run it in NodeJS.
Despite my AI degree, I am relatively new to this kind of thing. I have taken AI classes in college but none that would apply to this situation. So, I broke what I
needed to do into a few tasks.
1) I need to find a way to judge how good a given move in Tetris is.
2) I need to create an AI model capable of using this judgement method.
3) I need to find a way to train my AI so it can learn _how_ to make better decisions.

As always, the first thing to do in this scenario is research. I searched around and found a few papers. [This paper](https://kth.diva-portal.org/smash/get/diva2:815662/FULLTEXT01.pdf)
was very insightful and I found [this guy's report](https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/#:~:text=The%20score%20for%20each%20move,to%20either%20minimize%20or%20maximize.)
to be very helpful as well.

To summarize the content of both, the AI makes intelligent decisions by brute forcing all possible scenarios that can be made by dropping
a piece in every position/orientation from the top of the board. It then assigns a score to the resulting board based on certain
metrics that you define. The higher a score is, the worse the scenario is viewed as, so the scenario with the lowest score
is chosen and the piece is dropped from that position. This doesn't allow fancy moves like T-spins of course, but the finished product
does really well despite lacking those things.

An example metric that you would use to judge how bad a scenario is by looking at the number of holes you create by dropping a piece
in a location. For example:

<img src="/readmeImages/tetrisBad.png" style="width: 200px;" alt="Example of a bad move in Tetris. Notice how there are holes created by the piece dropped here"></img>

Dropping the red piece here creates holes underneath it that cannot be filled. Objectively speaking, it is one of the worst moves you could make
in this scenario.

For my AI, I chose to use 17 different metrics. Some of them are more important than others, but all in all they give my AI a pretty good
understanding of how the Tetris board looks in each scenario. Each metric is multiplied by a "weight" which essentially decides how
important that metric is when it comes to scoring the board. These weights are what makes one AI different from another AI in my project and
they are what get trained in the training process.

As for training, I chose to use a genetic algorithm. I did some looking around on the internet and found that the general structure for
a genetic algorithm is
1) Set up a population that will be tested in each generation of training.
2) Test each member of the population to assign it a fitness value. The fitness value is a measure of how well a given AI configuration performed.
3) Sort through the results of the generation and pull out the AI's that did the best. These will be the parents of the next generation.
4) Create the next population by combining the genetic code (configurations in my case) of two parents.
5) Apply some number of mutations to children in the new population.
6) Go back to step 2 and repeat this for the number of generations you wanted.
7) At the very end, pull out the best performing member of your population and that will be your result.

Keep in mind, this is a general overview and steps can be performed in different orders depending on where you look.

After creating the trainer in JS, I wrote another version in C++ which was **significantly** faster.

## The result
I am satisfied with how the training algorithms I wrote turned out. They work well and I learned a lot. I have never used genetic
algorithms before this nor have I programmed in C++. Above all, I like how cool the AI looks playing by itself on the website application.

I think there are other metrics I might add in the future to help improve the performance or I may  add optimizations that would allow
the AI to train faster. Right now, though, I like it!
