import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import UserPin from "./UserPin"
import { UserType, FolderType } from "../domain/user.types";
import useServiceState from "@/shared/hooks/useServiceState";
import { userService } from "../services/user.service";
import { useRouter } from "next/navigation";
import RequireServiceStateReady from "@/shared/components/RequireServiceStateReady";
import styles from './folderPin.module.scss';

export default function FolderPin({ folder }: { folder: FolderType }) {

   const router = useRouter();

   const userListState = useServiceState(async () => {
      if (folder.content) { return Promise.resolve(folder.content.slice(0, 3)); }
      else { 
         const users = await userService.search({ folderId: folder._id, limit: 3 });
         return users.list;
      }
   }, [folder])

   return (
      <RequireServiceStateReady serviceState={ userListState } >
         { (userList) => <FolderPinView title={ folder.title } userList={ userList } onClick={ () => router.push(`/searchUser/friends/${folder._id}`) } /> }
      </RequireServiceStateReady>
   )
}

function FolderPinView({ title, userList, onClick }: { title: string, userList: UserType[], onClick: () => void }) {
   
   return (
      <div className={ styles.folder }>

         <div className={ `${ styles.userCards } shielded` }>
            { userList[2] ? (
               <div className="cardContainer">
                  <UserPin user={userList[2]} />
               </div>
            ) : <div style={ {display: 'none'} }></div>}
            { userList[0] ? (
               <div className="cardContainer">
                  <UserPin user={userList[0]} />
               </div>
            ) : <div style={ {display: 'none'} }></div> }
            { userList[1] ? (
               <div className="cardContainer">
                  <UserPin user={userList[1]} />
               </div>
            ) : <div style={ {display: 'none'} }></div> }
         </div>

         <div className={ styles.visibleFolder }>
            <FontAwesomeIcon icon={faFolder} onClick={ onClick } />
            <p> { title } </p>
         </div>

      </div>
   )
}