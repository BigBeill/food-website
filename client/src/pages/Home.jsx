import React, { useEffect, useState } from 'react'
import NoteBook from '../components/NoteBook'

export default function Home() {

  const pageList = [
    {
      name: MainPage,
      props: {

      }
    }
  ]

  return <NoteBook pageList={pageList} />
}

function MainPage() {
  return (
    <h1>Public Recipes</h1>
  )
}

function DisplayRecipes(recipes) {

}