// import { Outlet, useNavigate } from 'react-router-dom';
// import { useAccessStatus } from './useAccessStatus';
// import { Loader2Icon } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// const AccessWrapper = () => {
//   const { access, isLoading } = useAccessStatus();
//   const navigate = useNavigate()
    
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen">
//       <div className={access ? '' : 'blur-sm pointer-events-none opacity-40'}>
//         <Outlet />
//       </div>
//       {!access && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/70 backdrop-blur-sm px-4 text-center">
//           <h2 className="text-xl font-semibold mb-2">Test muddat tugadi</h2>
//           <p className="text-sm text-muted-foreground mb-4">
//             Ilovadan foydalanishni davom etirish uchun premium oling.
//           </p>
//           <Button className="bg-black text-white rounded-xl px-6 py-2">
//             Premium olish
//           </Button>
//           <Button 
//           className="bg-black text-white rounded-xl px-6 py-2 mt-4" 
//           onClick={() => navigate(-1)}
//           >
//             Ortga qaytish
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessWrapper;
import { Outlet, useNavigate } from 'react-router-dom';
import { useAccessStatus } from './useAccessStatus';
import { Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccessWrapper = () => {
  const { isPremium, isLoading } = useAccessStatus();
  const navigate = useNavigate();
    
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className={isPremium ? '' : 'blur-sm pointer-events-none opacity-40'}>
        <Outlet />
      </div>
      {!isPremium && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/70 backdrop-blur-sm px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">premium muddati tugadi</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ilovadan foydalanishni davom etirish uchun premium oling.
          </p>
          <Button className="bg-black text-white rounded-xl px-6 py-2">
            Premium olish
          </Button>
          <Button 
            className="bg-black text-white rounded-xl px-6 py-2 mt-4" 
            onClick={() => navigate(-1)}
          >
            Ortga qaytish
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccessWrapper;