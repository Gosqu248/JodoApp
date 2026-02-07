# EAS Build i Submit - Instrukcja

## EAS Build

### Build dla jednej platformy

```bash
# iOS
eas build -p ios

# Android
eas build -p android
```

### Build dla wszystkich platform

```bash
eas build -p all
```

### Build z konkretnym profilem

```bash
eas build -p ios --profile production
eas build -p android --profile preview
```

### Przydatne opcje

```bash
# Build lokalny (bez wysyłania do serwerów EAS)
eas build --local

# Auto-submit po buildzie
eas build -p ios --auto-submit
```

---

## EAS Submit

### Submit do sklepów

```bash
# iOS (TestFlight)
eas submit -p ios

# Android (Google Play)
eas submit -p android

# Oba naraz
eas submit -p all
```

### Submit konkretnego builda

```bash
# Po ID buildu
eas submit -p ios --id <build-id>

# Lokalny plik
eas submit -p android --path ./app.aab
```

### Submit z profilem

```bash
eas submit -p ios --profile production
```

---

## Wymagania przed submitem

| Platforma | Wymagania |
|-----------|-----------|
| **iOS** | App Store Connect API Key lub Apple ID |
|         | Zwiększona wersja w `app.json` (`expo.version`) |
| **Android** | Google Play Service Account Key (JSON) |
|             | Signing key skonfigurowany |

---

## Typowy workflow

```bash
# 1. Zwiększ wersję w app.json
# "version": "1.0.1"

# 2. Zbuduj
eas build -p all --profile production

# 3. Submituj
eas submit -p all
```

---

## Publikacja w App Store (iOS)

Po submicie do TestFlight:

1. Wejdź na [App Store Connect](https://appstoreconnect.apple.com)
2. Wybierz aplikację
3. Kliknij **"+"** lub wybierz wersję
4. W sekcji **"Build"** wybierz build z TestFlight
5. Uzupełnij "What's New"
6. Kliknij **"Submit for Review"**
7. Po zatwierdzeniu (1-2 dni) aplikacja pojawi się w sklepie

---

## Publikacja w Google Play (Android)

Po submicie:

1. Wejdź na [Google Play Console](https://play.google.com/console)
2. Wybierz aplikację
3. Przejdź do **Release** → **Production**
4. Kliknij **"Create new release"**
5. Wybierz build lub dodaj AAB
6. Uzupełnij release notes
7. Kliknij **"Review release"** → **"Start rollout"**
