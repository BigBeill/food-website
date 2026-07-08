import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import AnimationSpin from '@/shared/animations/spin.animation';
import Spinner from '../icons/spinner';

export default function Loading() {
    return(
        <div className="standardPage" role="status" aria-live="polite">
            <div> 
                <Spinner />
                <p>Loading...</p>
            </div>
            <p>
                If its been over 15 minutes since you last accessed this site the <br />
                server may have gone into sleep mode. Give it a moment to wake up.
            </p>
        </div>
    )
}