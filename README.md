# AI organizér textu s Gemini

Aplikace pro analýzu a organizaci textu pomocí Google Gemini AI. Aplikace analyzuje text, rozpozná souvislosti, seřadí informace, přidá číslování a nadpisy s datem.

## Struktura projektu

Projekt je rozdělen do dvou hlavních částí:

### Backend (Node.js + Express)
- Komunikuje s Gemini API
- Zpracovává požadavky na analýzu textu
- Vrací strukturovaný text v HTML formátu

### Frontend (React)
- Uživatelské rozhraní pro zadávání textu
- Zobrazuje zpracovaný text
- Umožňuje kopírování výsledku

## Návod pro vytvoření mobilní aplikace pomocí Flutter

Pro vytvoření mobilní verze této aplikace použijte Flutter. Následující kódy a instrukce vám pomohou vytvořit mobilní aplikaci, která bude komunikovat se stejným backendem.

### Příprava Flutter projektu

1. Vytvořte nový Flutter projekt:
```bash
flutter create ai_text_organizer
cd ai_text_organizer
```

2. Upravte `pubspec.yaml` a přidejte potřebné závislosti:
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
  google_generativeai: ^0.1.1
```

3. Vytvořte soubor `.env` v kořenovém adresáři projektu:
```
GEMINI_API_KEY=váš_gemini_api_klíč
```

### Struktura mobilní aplikace

#### 1. Hlavní soubor - `lib/main.dart`
```dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'services/text_processing_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => TextProcessingService(),
      child: MaterialApp(
        title: 'AI Text Organizer',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          primaryColor: const Color(0xFF4285F4),
          fontFamily: 'Roboto',
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF4285F4),
            elevation: 0,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4285F4),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12.0),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: const BorderSide(color: Color(0xFF4285F4), width: 2.0),
            ),
          ),
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
```

#### 2. Služba pro zpracování textu - `lib/services/text_processing_service.dart`
```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class TextProcessingService extends ChangeNotifier {
  String? _processedText;
  bool _isLoading = false;
  String? _error;
  
  String? get processedText => _processedText;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Upravte URL podle toho, kde je váš server nasazen
  final String apiUrl = 'http://your-replit-server.repl.co/api/process-text';

  Future<void> processText(String text) async {
    if (text.isEmpty) return;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'text': text}),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        // Odstranit zpětné lomítka a zpracovat text
        String cleanedText = data['processedText'] ?? '';
        if (cleanedText.startsWith('```html')) {
          cleanedText = cleanedText.substring(7, cleanedText.length - 4);
        }
        _processedText = cleanedText;
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Chyba při komunikaci se serverem');
      }
    } catch (e) {
      _error = 'Chyba při zpracování textu: ${e.toString()}';
      if (kDebugMode) {
        print('Error processing text: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

#### 3. Domovská obrazovka - `lib/screens/home_screen.dart`
```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:share_plus/share_plus.dart';
import '../services/text_processing_service.dart';
import '../widgets/text_input_widget.dart';
import '../widgets/text_output_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _textController = TextEditingController();
  
  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final textService = Provider.of<TextProcessingService>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Organizér Textu'),
        actions: [
          if (textService.processedText != null)
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () {
                Share.share(textService.processedText!);
              },
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: textService.isLoading 
                ? const Center(
                    child: SpinKitWave(
                      color: Color(0xFF4285F4),
                      size: 50.0,
                    ),
                  )
                : textService.processedText == null
                    ? TextInputWidget(controller: _textController)
                    : const TextOutputWidget(),
            ),
            if (textService.error != null)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  textService.error!,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  if (textService.processedText != null)
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          setState(() {
                            Provider.of<TextProcessingService>(context, listen: false)
                               ._processedText = null;
                            Provider.of<TextProcessingService>(context, listen: false)
                               ._error = null;
                            Provider.of<TextProcessingService>(context, listen: false)
                               .notifyListeners();
                          });
                        },
                        child: const Text('Nový Text'),
                      ),
                    ),
                  if (textService.processedText == null)
                    Expanded(
                      child: ElevatedButton(
                        onPressed: textService.isLoading 
                          ? null 
                          : () => textService.processText(_textController.text),
                        child: const Text('Zpracovat Text'),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### 4. Widget pro vstup textu - `lib/widgets/text_input_widget.dart`
```dart
import 'package:flutter/material.dart';

class TextInputWidget extends StatelessWidget {
  final TextEditingController controller;
  
  const TextInputWidget({Key? key, required this.controller}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Vložte text k analýze',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: TextField(
              controller: controller,
              maxLines: null,
              expands: true,
              textAlignVertical: TextAlignVertical.top,
              decoration: const InputDecoration(
                hintText: 'Sem vložte svůj text...',
                border: OutlineInputBorder(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

#### 5. Widget pro výstup textu - `lib/widgets/text_output_widget.dart`
```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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
                child: SelectableText(textService.processedText!),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
```

### Vylepšení mobilní aplikace

#### 1. Použití API backendu místo přímého volání Gemini API

Pro spolehlivější provoz a lepší kontrolu nad zpracováním můžete upravit službu pro zpracování textu tak, aby používala náš backend API místo přímého volání Gemini API:

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

#### 2. Správné zobrazení HTML obsahu

Pro správné vykreslení HTML obsahu (nadpisů, odrážek, zvýraznění), je potřeba použít knihovnu `flutter_html`. Přidejte tuto knihovnu do `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  ...
  flutter_html: ^3.0.0-beta.2
```

Poté upravte `text_output_widget.dart`:

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

### Poznámky pro nasazení

1. Upravte URL v `text_processing_service.dart` tak, aby odpovídala skutečné adrese, kde je nasazen váš backend.
2. Nezapomeňte vytvořit soubor `.env` a přidat do něj váš Gemini API klíč (pokud používáte přímou integraci s Gemini API).
3. V případě problémů s komunikací s API serverem, zkontrolujte, zda máte nastavená správná oprávnění pro internet v `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

4. Pro iOS přidejte do `ios/Runner/Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

5. Pokud spouštíte aplikaci na fyzickém zařízení a připojujete se k lokálnímu backend serveru, ujistěte se, že je zařízení ve stejné síti jako počítač a použijte lokální IP adresu místo localhost nebo 10.0.2.2.
