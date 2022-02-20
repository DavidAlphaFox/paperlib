//
//  ContentView.swift
//  PaperLib
//
//  Created by GeoffreyChen on 26/11/2021.
//

import Combine
import SwiftUI

struct ContentView: View {
    @State private var colorTheme: String?
    private let container: DIContainer

    init(container: DIContainer) {
        self.container = container
    }

    var body: some View {
        MainView().inject(container)
            .frame(minWidth: 1300, minHeight: 800)
            .preferredColorScheme(colorScheme())
            .onReceive(colorSchemeUpdate, perform: {
                self.colorTheme = $0
            })
    }

    func colorScheme() -> ColorScheme? {
        switch colorTheme {
        case "System Default": return nil
        case "Light": return ColorScheme.light
        case "Dark": return ColorScheme.dark
        default:
            return nil
        }
    }

    var colorSchemeUpdate: AnyPublisher<String, Never> {
        UserDefaults.standard.publisher(for: \.preferColorTheme).eraseToAnyPublisher()
    }
}