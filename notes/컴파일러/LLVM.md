LLVM(Low-Level Virtual Machine)은 컴파일러 프레임워크이다. 

Efficiency, Flexibility, Modularity 측면에서 이점이 있다.

컴파일러를 구성하는 여러 요소를 모듈화하여 각각 구현된 여러 tools & libraries로 이루어져 있다. (일종의 collection)

C, C++, Rust, Swift 등 다양한 언어에 대응한다는 장점이 있다.

 프로그래머가 작성한 소스 코드를 [[LLVM IR]]의 형태로 가공한 뒤, 이렇게 생성된 중간코드를 최적화한 다음, 프로그램이 실행될 아키텍처에 해당하는 기계어로 변환된다.



