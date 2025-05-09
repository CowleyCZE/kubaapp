# AI Text Organizer - Mobilní aplikace

Tato mobilní aplikace používá Flutter pro vytvoření uživatelského rozhraní a komunikuje s backend serverem, který používá Gemini AI pro analýzu a strukturování textu.

## Popis funkčnosti

Aplikace umožňuje uživatelům:
1. Vložit libovolný text
2. Odeslat text k analýze pomocí AI
3. Zobrazit zpracovaný text s automatickým číslováním a nadpisy s datem
4. Kopírovat a sdílet výsledek

## Potřebné závislosti

V souboru `pubspec.yaml` přidejte následující závislosti:

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.5
  http: ^1.1.0
  provider: ^6.0.5
  share_plus: ^7.0.2
  flutter_spinkit: ^5.2.0
  flutter_dotenv: ^5.1.0
  flutter_html: ^3.0.0-beta.2  # Pro správné zobrazení HTML obsahu
```

## Použití backend API

Místo přímého volání Gemini API můžete využít náš backend server. Upravte soubor `lib/services/text_processing_service.dart` následovně:

```dart
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TextProcessingService extends ChangeNotifier {
  String? _processedText;
  bool _isLoading = false;
  String? _error;
  
  // URL k našemu API backendu - bude nutné aktualizovat podle skutečného nasazení
  // Pro lokální testování s emulátorem použijte IP adresu počítače místo localhost
  // Pro Android emulátor: 10.0.2.2 (speciální adresa, která směruje na localhost počítače)
  final String _apiUrl = 'http://10.0.2.2:8000/api/process-text';
  
  String? get processedText => _processedText;
  bool get isLoading => _isLoading;
  String? get error => _error;

  set processedText(String? value) {
    _processedText = value;
    notifyListeners();
  }

  Future<void> processText(String text) async {
    if (text.isEmpty) return;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Volání našeho vlastního API backendu místo přímého volání Gemini
      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'text': text,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _processedText = data['processedText'];
      } else {
        // Zpracování chyby od serveru
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Chyba při komunikaci se serverem');
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Chyba při zpracování textu: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      
      if (kDebugMode) {
        print('Error processing text: $e');
      }
    }
  }
}
```

## Zobrazení HTML obsahu

Pro správné zobrazení HTML obsahu (nadpisy, seznamy, zvýraznění), upravte soubor `lib/widgets/text_output_widget.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_html/flutter_html.dart';
import '../services/text_processing_service.dart';
import 'package:flutter/services.dart';

class TextOutputWidget extends StatelessWidget {
  const TextOutputWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final textService = Provider.of<TextProcessingService>(context);
    
    if (textService.processedText == null) {
      return const Center(
        child: Text('Zatím nebyl zpracován žádný text.'),
      );
    }
    
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Zpracovaný text',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.copy),
                tooltip: 'Kopírovat do schránky',
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: textService.processedText!));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Text zkopírován do schránky'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16.0, 0, 16.0, 16.0),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: SingleChildScrollView(
                // Použití flutter_html knihovny pro správné zobrazení HTML
                child: Html(
                  data: textService.processedText!,
                  style: {
                    'h2': Style(
                      fontSize: FontSize(20.0),
                      color: const Color(0xFF4285F4),
                      margin: const EdgeInsets.only(bottom: 8.0, top: 16.0),
                    ),
                    'ol': Style(
                      margin: const EdgeInsets.only(left: 20.0),
                    ),
                    'li': Style(
                      margin: const EdgeInsets.only(bottom: 8.0),
                    ),
                    'strong': Style(
                      fontWeight: FontWeight.bold,
                    ),
                  },
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
```

## Instrukce pro nasazení

1. Nahraďte v `text_processing_service.dart` URL `_apiUrl` adresou, kde je nasazen backend server.
2. Přidejte oprávnění pro přístup k internetu v souboru `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```
3. Pro iOS přidejte do `ios/Runner/Info.plist`:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
   </dict>
   ```
4. Pokud testujete na fyzickém zařízení, ujistěte se, že je ve stejné síti jako backend server a použijte správnou IP adresu.

## Praktické tipy

1. Pokud používáte Android emulátor, použijte adresu `10.0.2.2` pro přístup k localhost na hostitelském počítači.
2. Na fyzickém zařízení Android/iOS použijte lokální IP adresu vašeho počítače (např. `192.168.1.100`).
3. Pro produkční nasazení použijte veřejnou URL adresu vašeho backendu.
4. Nezapomeňte, že backend musí být spuštěn a dostupný, aby aplikace fungovala správně.