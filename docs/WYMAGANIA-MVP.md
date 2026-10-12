# Programowalne Tower Defense — wymagania MVP

Status: robocza specyfikacja. Ostatnia aktualizacja: 2026-10-12.
Dokument jest źródłem ustaleń. Propozycje nie są zatwierdzonymi wymaganiami.

## Cel i etapy

Stworzyć przy użyciu AI grywalną grę przeglądarkową dla dwóch graczy, stanowiącą podstawę dalszego rozwoju. Kod i dokumentacja mają być na GitHubie.

Kolejność prac: wymagania → stack technologiczny i infrastruktura → implementacja → deployment. Nie wybieramy stacku przed zakończeniem wymagań.

## Potwierdzone założenia

- Gra typu tower defense dla dwóch graczy.
- Każdy gracz buduje i ulepsza wieże oraz produkuje i ulepsza moby.
- Wieże i moby działają autonomicznie. Moby próbują dotrzeć do bazy przeciwnika.
- Gracz przegrywa po przepuszczeniu N mobów do swojej bazy. Wartość N pozostaje do ustalenia.
- Strategię gracza realizuje kod wywołujący udostępniony interfejs, np. budowanie, produkcja i ulepszanie.
- Prosta grafika; aplikacja dostępna w przeglądarce.
- MVP musi umożliwiać rozegranie pełnego meczu.
- MVP uruchamia pojedynek dwóch skryptów w jednej przeglądarce.
- Interfejs zawiera dwa edytory strategii, przycisk start i podgląd meczu.
- Rozgrywka dwóch osób online jest poza zakresem MVP.
- Zabezpieczenia i optymalizacja kodu dostarczonego przez gracza są poza zakresem MVP. Walidacja kodu jest planowana na późniejszy etap.
- Ustalenia przechowujemy w pliku, docelowo w repozytorium GitHub.

## Decyzje do podjęcia

1. Przebieg meczu: strategie ustalane przed startem czy edytowane podczas gry; czas rzeczywisty czy tury; warunki remisu i maksymalny czas.
2. Model rywalizacji: lokalny pojedynek dwóch skryptów jest ustalony; pozostaje decyzja o strategiach demonstracyjnych.
3. Mapa: osobne tory czy wspólna plansza; stałe ścieżki czy wyznaczanie drogi; miejsca budowy; blokowanie drogi.
4. Ekonomia: zasoby początkowe, przychód, nagrody za zabicia, koszty, limity i czas produkcji.
5. Jednostki: typy wież i mobów, ich parametry, wybór celu, zakres i zasady ulepszeń.
6. Interfejs kodu: język gracza, dostępne akcje i obserwacje, momenty wywołań strategii, widoczność przeciwnika, obsługa błędów.
7. Doświadczenie użytkownika: edytor, przykładowe strategie, instrukcja API, logi, obserwacja meczu, wynik i restart.
8. Dane i tożsamość: konta lub gra bez logowania; zapis kodu, historii i powtórek.
9. Zakres udostępnienia MVP: zaufani testerzy czy publiczny dostęp; urządzenia i przeglądarki.
10. Kryteria odbioru: scenariusze potwierdzające grywalność i poprawność zasad.

## Propozycja do omówienia: pierwsza grywalna wersja

- Gracze przygotowują kod przed startem; po starcie obserwują autonomiczny mecz.
- Jedna symetryczna mapa z dwoma osobnymi, stałymi torami oraz wyznaczonymi miejscami budowy.
- Niewielka liczba typów wież i mobów, jeden zasób oraz proste ulepszenia.
- Przykładowe działające strategie i czytelne logi błędów.
- Brak rankingu, matchmakingu, kampanii i płatności.

Powyższe propozycje wymagają potwierdzenia.

## Rejestr decyzji

- 2026-10-12: zapisano początkowe założenia użytkownika; stack i infrastruktura pozostają nieustalone.
- 2026-10-12: zatwierdzono lokalny pojedynek dwóch skryptów w jednej przeglądarce, dwa edytory, przycisk start i obserwację meczu; multiplayer online poza MVP.

## Repozytorium

Repozytorium: https://github.com/maciejkoch/code-tower-defense
Właściciel: maciejkoch. Widoczność: publiczne.
Dokument w repozytorium: docs/WYMAGANIA-MVP.md.
