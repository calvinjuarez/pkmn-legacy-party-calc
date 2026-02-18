<script setup>
import { calculate, Pokemon, Move } from '@smogon/calc'

const result = calculate(
  9,
  new Pokemon(9, 'Pikachu', { level: 50 }),
  new Pokemon(9, 'Charizard', { level: 50 }),
  new Move(9, 'Thunderbolt')
)

const damageStr = Array.isArray(result.damage) ? result.damage.join('-') : String(result.damage)
</script>

<template>
  <article>
    <h1>Pokemon Calculator</h1>
    <p>@smogon/calc loaded. Sample: Pikachu Thunderbolt vs Charizard = {{ damageStr }}%</p>
  </article>
</template>
