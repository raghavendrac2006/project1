import { useState } from 'react'
import {
  Lock,
  Eye,
  Bell,
  Languages,
  Palette,
  Accessibility,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useTheme, useLanguage, useToast } from '@/hooks'
import { userService } from '@/services/user.service'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import { civicStorage } from '@/services/storage'
import type { UserSettings } from '@/types'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [settings, setSettings] = useState<UserSettings>(() => civicStorage.getSettings())
  const toast = useToast()

  const handleUpdate = async (newSettings: Partial<UserSettings>) => {
    try {
      const updated = await userService.updateSettings(newSettings)
      setSettings(updated)
      toast.success('Preference Saved', 'Changes applied instantly.')
    } catch {
      toast.error('Save Failed', 'Please try again.')
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          System Preferences & Security Controls
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Configure security credentials, biometric 2FA, regional language, and accessibility modes
        </p>
      </div>

      <Tabs defaultValue="security" className="w-full">
        {/* Scrollable Tabs List */}
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <TabsList className="h-11 w-full justify-start sm:justify-center">
            <TabsTrigger value="security" className="gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5" /> Security & 2FA
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> Privacy & Audit
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs">
              <Bell className="w-3.5 h-3.5" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-1.5 text-xs">
              <Languages className="w-3.5 h-3.5" /> Language
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 text-xs">
              <Palette className="w-3.5 h-3.5" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="gap-1.5 text-xs">
              <Accessibility className="w-3.5 h-3.5" /> Accessibility
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Two-Factor Authentication & Biometrics</CardTitle>
              <CardDescription className="text-xs">
                Protect sensitive identity vaults with hardware authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">Two-Factor Security (2FA)</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Require SMS or TOTP authorization code on every login
                  </p>
                </div>
                <Switch
                  checked={settings.account.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    handleUpdate({ account: { ...settings.account, twoFactorEnabled: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-foreground">Biometric Unlock</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Allow Windows Hello or Fingerprint for instant smart pass verification
                  </p>
                </div>
                <Switch
                  checked={settings.account.biometricUnlock}
                  onCheckedChange={(checked) =>
                    handleUpdate({ account: { ...settings.account, biometricUnlock: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-foreground">New Terminal Login Notifications</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Receive instant alerts whenever your identity is accessed from a new device
                  </p>
                </div>
                <Switch
                  checked={settings.account.loginNotifications}
                  onCheckedChange={(checked) =>
                    handleUpdate({ account: { ...settings.account, loginNotifications: checked } })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Citizen Data Privacy & Consent</CardTitle>
              <CardDescription className="text-xs">
                Control how government departments access your verified vaults
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">Third-Party Data Sharing</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Allow banks and utilities to query KYC validity automatically
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.dataSharingAuthorized}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      privacy: { ...settings.privacy, dataSharingAuthorized: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-foreground">Visible Verification Inquiries</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Display audit records of all departments who inspected your citizen card
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.auditLogsVisible}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      privacy: { ...settings.privacy, auditLogsVisible: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-foreground">Electoral Directory Public Search</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Permit public municipal voter roll lookups by name
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.publicDirectorySearch}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      privacy: { ...settings.privacy, publicDirectorySearch: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Statutory Notification Channels</CardTitle>
              <CardDescription className="text-xs">
                Choose delivery methods for urgent alerts and statutory deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">Email Notifications</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Receive receipts, certificate dispatch notes, and query alerts via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      notifications: { ...settings.notifications, emailAlerts: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-foreground">SMS Alerts</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Receive 2FA codes and critical statutory deadline reminders via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.smsAlerts}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      notifications: { ...settings.notifications, smsAlerts: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-foreground">Civic News & Gazette Notices</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Periodic advisories regarding municipal projects and public consultations
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.civicNews}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      notifications: { ...settings.notifications, civicNews: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Language Tab */}
        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Regional Language & Localization</CardTitle>
              <CardDescription className="text-xs">
                Select your preferred civic communication medium
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code)
                      handleUpdate({ language: l.code })
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      language === l.code
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-subtle'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{l.flag}</span>
                      {language === l.code && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm font-bold mt-2">{l.nativeName}</p>
                    <p className="text-xs text-muted-foreground">{l.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Interface Appearance & Theme</CardTitle>
              <CardDescription className="text-xs">
                Custom tailored high-contrast and low-light visual palettes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-subtle'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Sun className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-xs font-bold text-foreground">Clean Light Mode</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">High clarity daylight</p>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-subtle'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Moon className="w-8 h-8 mx-auto mb-2 text-sky-400" />
                  <p className="text-xs font-bold text-foreground">Obsidian Dark Mode</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Deep civic sapphire</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">WCAG 2.2 AA Accessibility Controls</CardTitle>
              <CardDescription className="text-xs">
                Empower all citizens with customized contrast, motion, and typography sizing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">High Contrast Mode</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Enhance text boundaries and border contrast ratios
                  </p>
                </div>
                <Switch
                  checked={settings.appearance.highContrast}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      appearance: { ...settings.appearance, highContrast: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-foreground">Reduced Motion</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Disable non-essential micro-animations and smooth scroll transitions
                  </p>
                </div>
                <Switch
                  checked={settings.appearance.reducedMotion}
                  onCheckedChange={(checked) =>
                    handleUpdate({
                      appearance: { ...settings.appearance, reducedMotion: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
