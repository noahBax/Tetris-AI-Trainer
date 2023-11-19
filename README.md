# Tetris-AI-Trainer
An implementation for training my Artificial Intelligence Tetris bot

## Contents
This repository has scripts that are able designed to train the weights for a Tetris bot that I created that runs in the browser.
There are two versions of the script.
One is written in NodeJS (a program to execute Javascript outside the browser)and the other is written in C++ and is
**significantly** faster than the one written in Javascript.
It also contains a simple web page that can demonstrate the results of training.

## Backstory
Here's some context for why I built these things in the first place. In October of 2023, I decided I wanted to build a game of Tetris.
So I pulled an all nighter and finished the game in about 3 hours.
Why was it an all nighter? Because the rest of the night was spent styling the game and going back and forth with my roommate, who was an
avid Tetris player in his teens, to try to get the look and feel of the game right. In the end, I reached a point where I was
satisfied with the end product.

It was only after programming Tetris that I realized I was bad at it. I couldn't compare to my Dad, my roommate, or even my Mother (who
is notoriously bad at video games I'll have you know).
So I decided I should create an AI to do it. To allow me to compete with my self-proclaimed rivals. 

## How this was accomplished
I am most familiar with Javascript, so I decided (at first) that I would write the training algorithm in JS and run it in NodeJS.
Despite my AI degree, I am relatively new to this kind of thing. I have taken AI classes in college but none that would apply to this situation. So I broke what I
needed to do into a few tasks.
1) I need to find way to judge how good a given move in Tetris is.
2) I need to create an AI model capable of using this judgement method.
3) I need to find a way to train my AI so it can learn _how_ to make better decisions.

As always the first thing to do in this scenario is research. I searched around and found a few papers. [This paper](https://kth.diva-portal.org/smash/get/diva2:815662/FULLTEXT01.pdf)
was very insightful and I found [this guys report](https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/#:~:text=The%20score%20for%20each%20move,to%20either%20minimize%20or%20maximize.)
to be very helpful as well.

To summarize the content of both, the AI makes intelligent decisions by brute forcing all possible scenarios that can be made by dropping
the next piece in every position/orientation from the top of the board. It then assigns a score to the board based on certain metrics
that you define. The higher a score is, the worse the scenario is viewed as here, so the scenario with the lowest score
is chosen and the piece is dropped from that position.

An example metric that you would use to judge how bad a scenario is is by looking at the amount of holes you create by dropping a piece
in a location. For example:

<img src="/readmeImages/tetrisBad.png" style="width: 200px;" alt="Example of Tetris bad move"></img>

Dropping the red piece here creates holes underneath it that cannot be filled. Objectively speaking, it is the worst move you could make
in this scenario.

In my AI, I chose to use 17 different metrics. Some of them are more important than others, but all in all they give my AI a pretty good
understanding of how the Tetris board looks in a given scenario. An AI here is defined by a set of weights, where each weight in my is
associated with a corresponding metric and is either multiplied by or is an exponent to that metric.

As for training, I chose to use a genetic algorithm. I did some looking around on the internet and found that the general structure for
a genetic algorithm is
1) Set up a population that will be tested in each generation of training.
2) Test each member of the population to assign it a fitness value. The fitness value is a measure of how well a given AI configuration performed.
3) Sort through the results of the generation and pull out the AI's that did the best. These will be the parents of the next generation.
4) Create the next population by combining the genetic code (configurations in my case) of two parents.
5) Apply some amount of mutations to children in the new population.
6) Go back to step 2 and repeat this for the number of generations you wanted.

Keep in mind, this is a general overview and steps can be done in different orders depending on where you look.

## The result
I am satisfied with how the results look at this point.
