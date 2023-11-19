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
I am relatively new to this kind of thing. I have taken AI classes in college but none that would apply here. So I broke what I
needed to do into two tasks.
1) I need to find way to judge how good a given move in Tetris is.
2) I need to create an AI capable of using this judgement method.
3) I need to find a way to train my AI so it can learn _how_ to make better decisions.

And I know these may seem very vague, but I'm dealing with something I don't know exactly how to describe.

As always the first thing to do in this scenario is research. I searched around and found a few papers. [This paper](https://kth.diva-portal.org/smash/get/diva2:815662/FULLTEXT01.pdf)
was very insightful and I found [this guys report](https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/#:~:text=The%20score%20for%20each%20move,to%20either%20minimize%20or%20maximize.)
to be very helpful as well.

To summarize the content of both, the AI makes intelligent decisions by brute forcing all possible decisions that can be made by dropping
the next piece in every position/orientation from the top of the board. It then assigns a score to the board based on certain metrics
that you define. In this specific case, the higher a score is, the worse the scenario is viewed as. So the scenario with the lowest score
is chosen and the piece is dropped from that position.

An example metric that you would use to judge how bad a scenario is is by looking at the amount of holes you create by dropping a piece
in a location. For example:

<img src="/readmeImages/tetrisBad.png" style="width: 200px;" alt="Example of Tetris bad move"></img>

Dropping the red piece here creates holes underneath it that cannot be filled. Objectively speaking, it is the worst move you could make
in this scenario.

In my AI, I chose to use 17 different metrics. Some of them are more important than others, but all in all they give my AI a pretty good
understanding of how the Tetris board looks in a given scenario. Each weight in my AI is associated with a corresponding metric and is
either multiplied by or is an exponent to that metric.

As for training, I chose to use a genetic algorithm. I asked ChatGPT about what I should do for this and it gave me a rough outline of things
I should do. Most of it was me figuring out what things worked best for my use specifically.

## The result
I am satisfied with how the results look at this point.
