/* 
returned div className: activeSearchBar

3 inputs:
  currentValue: string representing value currently in search bar
  options: an array of json objects {name: string, _id: string} representing options user can select from
  eventHandler: function for handling an event with the following possible values for event.type:
    change: the value of whats in the search bar has changed (access new value with event.target.value)
    click: one of the options provided has been clicked (access option value with event.target.value and option _id with event.target.id)

2 main components:
  input: the search bar itself
  ul: list of all the options available to user
*/

function ActiveSearchBar({ currentValue, options, eventHandler }) {
  return (
    <div className="activeSearchBar">
      <input 
      type='text'
      value={currentValue}
      onChange={eventHandler}
      placeholder='Ingredient Name'/>

      <ul>
        {options.map((option) => {
          return(
            <button
            value={option.name}
            type='button'
            key={option._id}
            onClick={eventHandler}>
              {option.name}
            </button>
          )
        })}
      </ul>
    </div>
  )
}

export default ActiveSearchBar