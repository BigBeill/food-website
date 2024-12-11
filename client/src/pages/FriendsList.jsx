import NoteBook from "../components/NoteBook"

export default function FriendsList(){
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
        <div>
            <div className="radioContainer">
                <input type="radio" id="viewFriends" name="searchType" value="viewFriends"></input>
                <label htmlFor="viewFriends">My Friends</label>
            </div>
            <div className="radioContainer">
                <input type="radio" id="viewFriendRequests" name="searchType" value="viewFriendRequests"></input>
                <label htmlFor="viewFriendRequests">Friend Requests</label>
            </div>
            <div className="radioContainer">
                <input type="radio" id="findNewFriends" name="searchType" value="findNewFriends"></input>
                <label htmlFor="findNewFriends">Add New Friends</label>
            </div>
        </div>
    )
}