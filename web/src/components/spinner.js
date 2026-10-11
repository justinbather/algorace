import { FerrisWheelSpinnerOverlay } from 'react-spinner-overlay'



export const Spinner = ({ loading }) => {


  return (
    <FerrisWheelSpinnerOverlay loading={loading} size={80}
      overlayColor="rgba(0,0,0,0.5)" color="#fff" />

  )
}
