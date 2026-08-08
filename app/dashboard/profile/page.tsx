'use client';

import {
  Shield,
  UserRound,
  Mail,
  Phone,
  AtSign,
  User,
  LockKeyhole,
  LogOut,
  Trash2,
} from 'lucide-react';

import {PageHero} from '@/components/dashboard/shared/PageHero';
import {DashboardCard} from '@/components/dashboard/shared/DashboardCard';
import {DashboardSection} from '@/components/dashboard/shared/DashboardSection';
import {LoadingCard} from '@/components/dashboard/shared/LoadingCard';
import {SectionTitle} from '@/components/dashboard/shared/SectionTitle';

import ProfileHero from '@/components/dashboard/profile/ProfileHero';
import EditProfileDialog from '@/components/dashboard/profile/EditProfileDialog';
import ChangePasswordDialog from '@/components/dashboard/profile/ChangePasswordDialog';
import LogoutDialog from '@/components/dashboard/profile/LogoutDialog';
import DeleteAccountDialog from '@/components/dashboard/profile/DeleteAccountDialog';

import {useProfile} from '@/hooks/useProfile';
import {usePurchases} from '@/hooks/usePurchases';



export default function ProfilePage() {


  const {
    user,
    loading,
  } = useProfile();


  const {
    plan,
  } = usePurchases();



  if (loading || !user) {

    return <LoadingCard />;

  }



  const profileItems = [

    {
      label: 'Full Name',
      value: user.fullName,
      icon: User,
    },

    {
      label: 'Username',
      value: `@${user.username}`,
      icon: AtSign,
    },

    {
      label: 'Email Address',
      value: user.email,
      icon: Mail,
    },

    {
      label: 'Phone Number',
      value: user.phoneNumber || 'N/A',
      icon: Phone,
    },

  ];



  return (

    <div className="space-y-10">


      <PageHero

        title="My Profile"

        description="Manage your personal information, security and account settings."

      />



      {/* Profile Hero */}

      <DashboardSection>

        <ProfileHero

          user={user}

          plan={plan}

        />

      </DashboardSection>





      {/* Personal Information */}

      <DashboardSection>


        <div className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <SectionTitle

            title="Personal Information"

            description="View and update your profile information."

            icon={UserRound}

          />


          <EditProfileDialog

            user={user}

          />

        </div>



        <DashboardCard>


          <div className="
            grid
            gap-5
            sm:grid-cols-2
            p-4
          ">


            {
              profileItems.map((item) => {


                const Icon = item.icon;


                return (

                  <div

                    key={item.label}

                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-border/60
                      bg-card/60
                      p-5
                      backdrop-blur-xl
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-primary/40
                      hover:shadow-xl
                    "

                  >


                    <div className="
                      absolute
                      -right-8
                      -top-8
                      h-24
                      w-24
                      rounded-full
                      bg-primary/10
                      blur-2xl
                    "/>



                    <div className="
                      relative
                      flex
                      items-center
                      gap-4
                    ">


                      <div className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                      ">

                        <Icon size={20}/>

                      </div>



                      <div>

                        <p className="
                          text-xs
                          uppercase
                          tracking-wider
                          text-muted-foreground
                        ">

                          {item.label}

                        </p>


                        <p className="
                          mt-1
                          font-semibold
                          break-all
                        ">

                          {item.value}

                        </p>


                      </div>


                    </div>


                  </div>

                );


              })
            }


          </div>


        </DashboardCard>


      </DashboardSection>







      {/* Security */}


      <DashboardSection>


        <SectionTitle

          title="Security"

          description="Manage your account password."

          icon={Shield}

        />



        <DashboardCard>


          <div className="
            flex
            flex-col
            gap-6
            md:flex-row
            md:items-center
            md:justify-between
            p-8
          ">



            <div className="
              flex
              items-center
              gap-4
            ">


              <div className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-emerald-500/10
                text-emerald-500
              ">

                <LockKeyhole size={22}/>

              </div>



              <div>


                <p className="
                  text-sm
                  text-muted-foreground
                ">

                  Password

                </p>


                <p className="
                  font-semibold
                  tracking-[0.35em]
                ">

                  ••••••••••••

                </p>


              </div>


            </div>




            <ChangePasswordDialog />



          </div>


        </DashboardCard>


      </DashboardSection>







      {/* Account Actions */}


      <DashboardSection>


        <SectionTitle

          title="Account Actions"

          description="Manage your account session."

        />



        <div className="
          grid
          gap-6
          md:grid-cols-2
        ">



          <DashboardCard>


            <div className="
              flex
              flex-col
              gap-5
              p-4
            ">


              <div className="
                flex
                items-center
                gap-4
              ">


                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-500/10
                  text-blue-500
                ">

                  <LogOut size={22}/>

                </div>



                <div>


                  <h3 className="font-semibold">

                    Logout

                  </h3>


                  <p className="
                    text-sm
                    text-muted-foreground
                  ">

                    End your current session securely.

                  </p>


                </div>


              </div>



              <LogoutDialog />


            </div>


          </DashboardCard>





          <DashboardCard>


            <div className="
              flex
              flex-col
              gap-5
              p-4
            ">


              <div className="
                flex
                items-center
                gap-4
              ">


                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-500/10
                  text-red-500
                ">

                  <Trash2 size={22}/>

                </div>



                <div>


                  <h3 className="font-semibold">

                    Delete Account

                  </h3>


                  <p className="
                    text-sm
                    text-muted-foreground
                  ">

                    Permanently remove your account.

                  </p>


                </div>


              </div>



              <DeleteAccountDialog />


            </div>


          </DashboardCard>



        </div>


      </DashboardSection>



    </div>

  );

}