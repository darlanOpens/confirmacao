warning: in the working copy of 'src/components/CheckinPage.tsx', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/components/CheckinPage.tsx b/src/components/CheckinPage.tsx[m
[1mindex e5db39b..cbdd635 100644[m
[1m--- a/src/components/CheckinPage.tsx[m
[1m+++ b/src/components/CheckinPage.tsx[m
[36m@@ -174,43 +174,147 @@[m [mexport default function CheckinPage({ guests: initialGuests }: CheckinPageProps)[m
           Check-in do Evento[m
         </Typography>[m
         [m
[31m-        <Grid container spacing={2} sx={{ mb: 3 }}>[m
[31m-          <Grid item xs={12} sm={4}>[m
[31m-            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>[m
[31m-              <CardContent sx={{ textAlign: 'center', py: 2 }}>[m
[31m-                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>[m
[32m+[m[32m        <Grid container spacing={3} sx={{ mb: 4 }}>[m
[32m+[m[32m          <Grid item xs={6} sm={3}>[m
[32m+[m[32m            <Card sx={{[m[41m [m
[32m+[m[32m              bgcolor: 'grey.50',[m[41m [m
[32m+[m[32m              border: '1px solid',[m
[32m+[m[32m              borderColor: 'grey.200',[m
[32m+[m[32m              boxShadow: 'none',[m
[32m+[m[32m              '&:hover': { boxShadow: 1 }[m
[32m+[m[32m            }}>[m
[32m+[m[32m              <CardContent sx={{ textAlign: 'center', py: 3, px: 2 }}>[m
[32m+[m[32m                <Typography[m[41m [m
[32m+[m[32m                  variant="h2"[m[41m [m
[32m+[m[32m                  component="div"[m[41m [m
[32m+[m[32m                  sx={{[m[41m [m
[32m+[m[32m                    fontWeight: 300,[m[41m [m
[32m+[m[32m                    color: 'text.primary',[m
[32m+[m[32m                    fontSize: { xs: '2rem', sm: '2.5rem' }[m
[32m+[m[32m                  }}[m
[32m+[m[32m                >[m
                   {stats.total}[m
                 </Typography>[m
[31m-                <Typography variant="body2">[m
[31m-                  Total Confirmados[m
[32m+[m[32m                <Typography[m[41m [m
[32m+[m[32m                  variant="caption"[m[41m [m
[32m+[m[32m                  sx={{[m[41m [m
[32m+[m[32m                    color: 'text.secondary',[m
[32m+[m[32m                    fontSize: '0.75rem',[m
[32m+[m[32m                    fontWeight: 500,[m
[32m+[m[32m                    textTransform: 'uppercase',[m
[32m+[m[32m                    letterSpacing: '0.5px'[m
[32m+[m[32m                  }}[m
[32m+[m[32m                >[m
[32m+[m[32m                  Confirmados[m
                 </Typography>[m
               </CardContent>[m
             </Card>[m
           </Grid>[m
[31m-          <Grid item xs={12} sm={4}>[m
[31m-            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>[m
[31m-              <CardContent sx={{ textAlign: 'center', py: 2 }}>[m
[31m-                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>[m
[32m+[m[32m          <Grid item xs={6} sm={3}>[m
[32m+[m[32m            <Card sx={{[m[41m [m
[32m+[m[32m              bgcolor: 'success.50',[m[41m [m
[32m+[m[32m              border: '1px solid',[m
[32m+[m[32m              borderColor: 'success.200',[m
[32m+[m[32m              boxShadow: 'none',[m
[32m+[m[32m              '&:hover': { boxShadow: 1 }[m
[32m+[m[32m            }}>[m
[32m+[m[32m              <CardContent sx={{ textAlign: 'center', py: 3, px: 2 }}>[m
[32m+[m[32m                <Typography[m[41m [m
[32m+[m[32m                  variant="h2"[m[41m [m
[32m+[m[32m                  component="div"[m[41m [m
[32m+[m[32m                  sx={{[m[41m [m
[32m+[m[32m                    fontWeight: 300,[m[41m [m
[32m+[m[32m                    color: 'success.main',[m
[32m+[m[32m                    fontSize: { xs: '2rem', sm: '2.5rem' }[m
[32m+[m[32m                  }}[m
[32m+[m[32m                >[m
                   {stats.checkedIn}[m
                 </Typography>[m
[31m-                <Typography variant="body2">[m
[31m-                  Check-in Realizado[m
[32m+[m[32m                <Typography[m[41m [m
[32m+[m[32m                  variant="caption"[m[41m [m
[32m+[m[32m                  sx={{[m[41m [m
[32m+[m[32m                    color: 'success.dark',[m
[32m+[m[32m                    fontSize: '0.75rem',[m
[32m+[m[32m                    fontWeight: 500,[m
[32m+[m[32m                    textTransform: 'uppercase',[m
[32m+[m[32m                    letterSpacing: '0.5px'[m
[32m+[m[32m                  }}[m
[32m+[m[32m                >[m
[32m+[m[32m                  Check-in[m
                 </Typography>[m
               </CardContent>[m
             </Card>[m
           </Grid>[m
[31m-          <Grid item xs={12} sm={4}>[m
[31m-            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>[m
[31m-              <CardContent sx={{ textAlign: 'center', py: 2 }}>[m
[31m-                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>[m
[32m+[m[32m          <Grid item xs={6} sm={3}>[m
[32m+[m[32m            <Card sx={{[m[41m [m
[32m+[m[32m              bgcolor: 'warning.50',[m[41m [m
[32m+[m[32m              border: '1px solid',[m
[32m+[m[32m              borderColor: 'warning.200',[m
[32m+[m[32m              boxShadow: 'none',[m
[32m+[m[32m              '&:hover': { boxShadow: 1 }[m
[32m+[m[32m            }}>[m
[32m+[m[32m              <CardContent sx={{ textAlign: 'center', py: 3, px: 2 }}>[m
[32m+[m[32m                <Typography[m[41m [m
[32m+[m[32m                  variant="h2"[m[41m [m
[32m+[m[32m                  component="div"[m[41m [m
[32m+[m[32m                  sx={{[m[41m [m
[32m+[m[32m                    fontWeight: 300,[m[41m [m
[32m+[m[32m                    color: 'warning.main',[m
[32m+[m[32m                    fontSize: { xs: '2rem', sm: '2.5rem' }[m
[32m+[m[32m                  }}[m
[32m+[m[32m                >[m
                   {stats.pending}[m
                 </Typography>[m
[31m-                <Typography variant="body2">[m
[32m+[m[32m                <Typography[m[41m [m
[32m+[m[32m                  variant="caption"[m[41m [m
[32m+[m[32m                  sx={{[m[41m [m
[32m+[m[32m                    color: 'warning.dark',[m
[32m+[m[32m                    fontSize: '0.75rem',[m
[32m+[m[32m                    fontWeight: 500,[m
[32m+[m[32m                    textTransform: 'uppercase',[m
[32m+[m[32m                    letterSpacing: '0.5px'[m
[32m+[m[32m                  }}[m
[32m+[m[32m                >[m
                   Pendente[m
                 </Typography>[m
               </CardContent>[m
             </Card>[m
           </Grid>[m
[32m+[m[32m          <Grid item xs={6} sm={3}>[m
[32m+[m[32m            <Card sx={{[m[41m [m
[32m+[m[32m              bgcolor: 'info.50',[m[41m [m
[32m+[m[32m              border: '1px solid',[m
[32m+[m[32m              borderColor: 'info.200',[m
[32m+[m[32m              boxShadow: 'none',[m
[32m+[m[32m              '&:hover': { boxShadow: 1 }[m
[32m+[m[32m            }}>[m
[32m+[m[32m              <CardContent sx={{ textAlign: 'center', py: 3, px: 2 }}>[m
[32m+[m[32m                <Typography[m[41m [m
[32m+[m[32m                  variant="h2"[m[41m [m
[32m+[m[32m                  component="div"[m[41m [m
[32m+[m[32m                  sx={{[m[41m [m
[32m+[m[32m                    fontWeight: 300,[m[41m [m
[32m+[m[32m                    color: 'info.main',[m
[32m+[m[32m                    fontSize: { xs: '2rem', sm: '2.5rem' }[m
[32m+[m[32m                  }}[m
[32m+[m[32m                >[m
[32m+[m[32m                  {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%[m
[32m+[m[32m                </