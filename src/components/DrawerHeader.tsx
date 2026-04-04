import { useSidebar } from "@/components/ui/sidebar";
import AttenzyLogo from "@/assets/logo-trans.png";

export function DrawerHeader() {
  const { state, isMobile } = useSidebar();

  // Mobile → always minified
  if (isMobile) {
    return <img src={AttenzyLogo} className="h-10 mx-auto" alt="Attenzy" />;
  }

  // Desktop
  return (
    <div className="h-10 mt-2 flex items-center justify-center">
      {state === "collapsed" ? (
        <img src={AttenzyLogo} className="h-8" alt="Attenzy" />
      ) : (
        <>
          <img src={AttenzyLogo} className="h-12" alt="Attenzy" />
          <div className="ml-2 mr-4">
            <p className="text-xl font-bold">Attenzy</p>
            <p className="tracking-[6px] md:tracking-[7px] text-white text-[10px]">
              ADMIN
            </p>
          </div>
        </>
      )}
    </div>
  );
}
